# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com

from odoo import models, api
from ast import literal_eval

class Stockquant(models.Model):
    _inherit = 'stock.quant'

    @api.model_create_multi
    def create(self, vals_list):
        res = super(Stockquant, self).create(vals_list)
        for rec in res:
            if rec.location_id and rec.location_id.usage == 'internal' and not rec.lot_id.location_id_origin:
                rec.lot_id.location_id_origin = rec.location_id.id
            if (
                self.search_count(
                    [("lot_id", "=", rec.lot_id.id), ("id", "!=", rec.id)]
                )
                == 2
                and rec.lot_id.product_id.id
            ):
                stock_lot_values = {'product_id': rec.lot_id.product_id.id,
                                    'expiration_date': rec.lot_id.expiration_date}
                res_stock_lot_id = self.env['stock.lot'].create(stock_lot_values)
                rec.lot_id = res_stock_lot_id.id
                stock_lot_ids = self.env['stock.lot'].search([('product_id', '=', res_stock_lot_id.product_id.id),
                                             ('expiration_date_masdar_pos', '=',
                                              res_stock_lot_id.expiration_date_masdar_pos),
                                             ('location_id_warehouse_id', '=',
                                              res_stock_lot_id.location_id.warehouse_id.id),
                                             ('id', '!=', res_stock_lot_id.id)])
                if stock_lot_ids:
                    stock_lot_ids_product_qty = sum(stock_lot_ids.mapped('product_qty'))
                    stock_quant_ids = self.env['stock.quant'].sudo().browse(stock_lot_ids.quant_ids.ids)
                    if stock_quant_ids:
                        for s_q_id in stock_quant_ids:
                            s_q_id.quantity = 0.0
                        rec.quantity += stock_lot_ids_product_qty
        return res

    def action_view_stock_moves(self):
        self.ensure_one()
        action = self.env["ir.actions.actions"]._for_xml_id("stock.stock_move_line_action")
        action['domain'] = [
            '|',
                ('location_id', '=', self.location_id.id),
                ('location_dest_id', '=', self.location_id.id),
            '|',
                ('package_id', '=', self.package_id.id),
                ('result_package_id', '=', self.package_id.id),
        ]
        action['context'] = literal_eval(action.get('context'))
        action['context']['search_default_product_id'] = self.product_id.id
        return action







