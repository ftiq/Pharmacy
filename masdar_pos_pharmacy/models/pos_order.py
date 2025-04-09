# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import models, api

class PosOrder(models.Model):
    _inherit = 'pos.order'

    @api.model
    def create_from_ui(self, orders, draft=False):
        for order in orders:
            for _, _, line_data in order['data']['lines']:
                if 'uom_line_details' in line_data and line_data['qty']:
                    uom_uom_id = self.env['uom.uom'].browse(line_data['uom_line_details']['uom_id'][0])
                    if uom_uom_id:
                        reference_uom = uom_uom_id.category_id.uom_ids.filtered(lambda rec: rec.uom_type == 'reference')
                        if reference_uom:
                            reference_uom_ratio = reference_uom[0].ratio
                            if uom_uom_id.uom_type == 'smaller':
                                line_data['qty'] = (reference_uom_ratio / uom_uom_id.ratio) * line_data['qty']
                            elif uom_uom_id.uom_type == 'bigger':
                                line_data['qty'] = (reference_uom_ratio * uom_uom_id.ratio) * line_data['qty']
        return super(PosOrder, self).create_from_ui(orders, draft)