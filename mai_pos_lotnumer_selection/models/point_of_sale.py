# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) Kiran Kantesariya.
#
##############################################################################
from odoo import api, fields, models, tools, _
from odoo.exceptions import UserError, ValidationError
from odoo.tools import float_is_zero, float_compare
from datetime import datetime, timedelta
from itertools import groupby



class POSSession(models.Model):
    _inherit = 'pos.session'

    def _pos_ui_models_to_load(self):
        result = super()._pos_ui_models_to_load()
        result.extend(['stock.lot'])
        return result

    def _loader_params_stock_lot(self):
        domain = []
        from_date = (datetime.now() - timedelta(days=5))
        from_date_ = from_date.replace(minute=0, hour=0, second=0, microsecond=0)
        
        if self.config_id.allow_pos_lot:
            domain = [['create_date','>=',from_date_]]
        else:
            domain = [['id','=',0]];
             
        return {
            'search_params': {
                'domain': domain, 
                'fields': ['id','name','product_id','total_qty'],
            }
        }

    def _get_pos_ui_stock_lot(self, params):
        return self.env['stock.lot'].search_read(**params['search_params'])  

class pos_config(models.Model):
    _inherit = 'pos.config' 

    allow_pos_lot = fields.Boolean('Allow POS Lot/Serial Number', default=True)
    lot_expire_days = fields.Integer('Product Lot/Serial expire days.', default=1)
    pos_lot_receipt = fields.Boolean('Print Lot/Serial on receipt',default=1)


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    allow_pos_lot = fields.Boolean(related='pos_config_id.allow_pos_lot',readonly=False)
    lot_expire_days = fields.Integer(related='pos_config_id.lot_expire_days',readonly=False)
    pos_lot_receipt = fields.Boolean(related='pos_config_id.pos_lot_receipt',readonly=False)
    


class account_move_line(models.Model):
    _inherit = 'account.move.line' 

    lot_ids = fields.Many2many('stock.lot',string="Lots")
    pos_lot_ids = fields.Many2many('pos.pack.operation.lot',string="POS Lots")

class pos_order(models.Model):
    _inherit = 'pos.order' 

    def _prepare_invoice_line(self, order_line):
        res  = super(pos_order, self)._prepare_invoice_line(order_line)
        lots = order_line.pack_lot_ids.mapped('lot_name')
        lot_rec = self.env['stock.lot'].search([('name','in',lots)])
        res.update({
            'lot_ids': [(6, 0, lot_rec.ids)],
            'pos_lot_ids' : [(6, 0, order_line.pack_lot_ids.ids)],
        })
        return res


class stock_production_lot(models.Model):
    _inherit = "stock.lot"

    total_qty = fields.Float("Total Qty", compute="_computeTotalQty")
    # exp_date = fields.Datetime()

    def _computeTotalQty(self):
        for record in self:
            move_line = self.env['stock.move.line'].search([('lot_id','=',record.id)])
            record.total_qty = 0.0
            for rec in move_line:
                if rec.location_dest_id.usage in ['internal', 'transit']:
                    record.total_qty += rec.quantity
                else:
                    record.total_qty -= rec.quantity




