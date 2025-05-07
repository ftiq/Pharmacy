# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import models

class PosSession(models.Model):
    _inherit = 'pos.session'

    def _get_pos_ui_stock_lot(self, params):
        params['search_params']['fields'].append('expiration_date_masdar_pos')
        params['search_params']['fields'].append( 'location_id')
        params['search_params']['fields'].append('location_id_origin')
        return self.env['stock.lot'].search_read(**params['search_params'])

    def _get_pos_ui_uom_category(self, params):
        params['search_params']['fields'].append('uom_ids')
        return self.env["uom.category"].search_read(**params["search_params"])

    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result['search_params']['fields'].extend(['uom_id_origin'])
        return result


    def _loader_params_stock_warehouse(self):
        return { "search_params": { "fields" : ['name', 'lot_stock_id'] }}

    def _get_pos_ui_stock_warehouse(self, params):
        return self.env["stock.warehouse"].search_read(**params["search_params"])

    def _loader_params_stock_quant(self):
        return { "search_params": { "fields" : ['location_id', 'lot_id', 'product_id'] }}

    def _get_pos_ui_stock_quant(self, params):
        return self.env["stock.quant"].search_read(**params["search_params"])

    def _loader_params_stock_lot(self):
        return {"search_params": {"fields": ['id', 'name', 'product_id', 'total_qty']}}

    def _loader_params_stock_location(self):
        return { "search_params": { "fields" : ['name', 'location_id', 'parent_path', 'usage'] }}

    def _get_pos_ui_stock_location(self, params):
        return self.env["stock.location"].search_read(**params["search_params"])

    def _pos_ui_models_to_load(self):
        models = super()._pos_ui_models_to_load()
        models_to_load = ["stock.warehouse", "stock.quant", "stock.location"]
        for model in models_to_load:
            if model not in models:
                models.append(model)
        return models

    def getStocks(self, config_id, product_id):
        config = self.env['pos.config'].browse(config_id)
        location_id = config.picking_type_id.default_location_src_id.id
        stock_location_id = self.env['stock.location'].browse(config.warehouse_id.lot_stock_id.id).location_id[0].id
        stock_locations = self.env['stock.location'].search(
            [('parent_path', 'like', f"1/{stock_location_id}/{location_id}")])
        resstock_locations = stock_locations.ids
        stocks = self.env['stock.quant'].search_read(
            fields=['lot_id', 'location_id', 'quantity'],
            domain=[('product_id', '=', product_id), ('location_id', 'in', resstock_locations)])
        lot_ids = [stock['lot_id'][0] for stock in stocks if stock['lot_id']]
        lots = self.env['stock.lot'].browse(lot_ids)
        lot_expiration_dates = {lot.id: lot.expiration_date for lot in lots}
        for stock in stocks:
            if stock['lot_id']:
                stock['expiration_date'] = lot_expiration_dates.get(stock['lot_id'][0])
        return stocks








