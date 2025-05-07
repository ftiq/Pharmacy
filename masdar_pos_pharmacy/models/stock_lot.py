# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com

from odoo import models, fields, api

class StockLot(models.Model):
    _inherit = 'stock.lot'

    expiration_date_masdar_pos = fields.Date(string='Expiration Date', compute="_compute_expiration_date_masdar_pos",
                                             store=True)
    location_id_origin = fields.Many2one('stock.location', 'Location')
    location_id_warehouse_id = fields.Many2one(string="Warehouse", related='location_id.warehouse_id')

    @api.depends("expiration_date")
    def _compute_expiration_date_masdar_pos(self):
        for s_l in self:
            s_l.expiration_date_masdar_pos = s_l.expiration_date

    def _get_pos_ui_stock_lot(self, params):
        params['search_params']['fields'].append('expiration_date_masdar_pos')
        return self.env['stock.lot'].search_read(**params['search_params'])

    def _computeTotalQty(self):
        for record in self:
            record.total_qty = record.product_qty

    @api.model_create_multi
    def create(self, vals_list):
        res = super(StockLot, self).create(vals_list)
        for rec in res:
            rec.name = rec.name + ' ' + str(rec.expiration_date.date())
        return res

    @api.depends('quant_ids')
    def _compute_single_location(self):
        for lot in self:
            quants = lot.quant_ids.filtered(lambda q: q.quantity > 0)
            lot.location_id = quants.location_id if len(quants.location_id) == 1 else False
            if (lot.location_id and lot.location_id.warehouse_id.code and lot.location_id.warehouse_id.code
                    not in lot.name):
                lot.name = lot.location_id.warehouse_id.code + ' ' + lot.name
                if lot.quant_ids:
                    lot_quant_ids = lot.quant_ids.filtered(lambda rec: rec.location_id.id == self.env.ref(
                        "stock.stock_location_stock").id)
                    if lot_quant_ids:
                        stock_lot_ids = self.search([('product_id', '=', lot.product_id.id),
                                                     ('expiration_date_masdar_pos', '=', lot.expiration_date_masdar_pos),
                                                     ('location_id_warehouse_id', '=', lot.location_id.warehouse_id.id),
                                                     ('id', '!=', lot.id)])
                        if stock_lot_ids:
                            stock_lot_ids_product_qty = sum(stock_lot_ids.mapped('product_qty'))
                            stock_quant_ids = self.env['stock.quant'].sudo().browse(stock_lot_ids.quant_ids.ids)
                            if stock_quant_ids:
                                for s_q_id in stock_quant_ids:
                                    s_q_id.quantity = 0.0
                                lot_quant_ids.quantity += stock_lot_ids_product_qty





