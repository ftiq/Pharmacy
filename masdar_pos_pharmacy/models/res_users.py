# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com

from odoo import models, api

class ResUsers(models.Model):
    _inherit = 'res.users'

    @api.model_create_multi
    def create(self, vals_list):
        res = super(ResUsers, self).create(vals_list)
        for r_u_id in res:
            r_u_id.tz = 'Etc/GMT+3'
        return res








