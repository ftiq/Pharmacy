# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from odoo import models, api, fields


class ProductTemplate(models.Model):
    _inherit = "product.template"

    uom_id_origin = fields.Many2one(
        'uom.uom', 'Unit of Measure',
        compute="_compute_uom_id_origin",
        help="Default unit of measure used for all stock operations.")

    @api.depends("uom_id")
    def _compute_uom_id_origin(self):
        for p_t in self:
            p_t.uom_id_origin = p_t.uom_id