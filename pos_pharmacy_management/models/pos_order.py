# -*- coding: utf-8 -*-
#################################################################################
#
#   Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#   See LICENSE file for full copyright and licensing details.
#################################################################################
from odoo import fields, models, api

class PosOrder(models.Model):
    _inherit = 'pos.order'

    doctor = fields.Many2one('res.partner', 'Doctor')

    @api.model
    def _order_fields(self, ui_order):
        data = super(PosOrder, self)._order_fields(ui_order)
        data.update({ 'doctor': ui_order.get('doctor', False) })
        return data
    
    def _export_for_ui(self, order):
        result = super(PosOrder, self)._export_for_ui(order)
        result['doctor'] = order.doctor.id
        return result
    
class PosOrderLine(models.Model):
    _inherit = "pos.order.line"

    uom_id = fields.Many2one('uom.uom', string='Unit of Measure')

    @api.model
    def _order_line_fields(self, line, session_id=None):
        fields_return = super(PosOrderLine, self)._order_line_fields(line, session_id=None)
        if line and line[2] and line[2].get('uom_id'):
            fields_return[2].update({'uom_id': line[2].get('uom_id', '')})
        else:
            uom_id = self.get_product_uom(line[2].get('product_id'))
            fields_return[2].update({'uom_id': uom_id.id})
        return fields_return

    def get_product_uom(self, product_id):
        product = self.env['product.product'].browse(product_id)
        return product.uom_id