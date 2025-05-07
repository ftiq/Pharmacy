# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com

from odoo import api, models


class StockMoveLine(models.Model):
    _inherit = "stock.move.line"

    @api.onchange('lot_id')
    def _onchange_lot_id(self):
        if not self.picking_type_use_existing_lots or not self.product_id.use_expiration_date:
            return
        if self.lot_id:
            self.expiration_date = self.lot_id.expiration_date
        elif self.quant_id and self.quant_id.lot_id and self.quant_id.lot_id.expiration_date:
            self.expiration_date = self.quant_id.lot_id.expiration_date
        else:
            self.expiration_date = False

    @api.onchange('quant_id')
    def _onchange_quant_id(self):
        if not self.quant_id:
            return
        if self.quant_id.lot_id and self.quant_id.lot_id.expiration_date:
            self.expiration_date = self.quant_id.lot_id.expiration_date
        else:
            self.expiration_date = False

