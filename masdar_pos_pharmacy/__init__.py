# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

from . import models

def pre_init_check(cr):
    from odoo.service import common
    from odoo.exceptions import UserError
    version_info = common.exp_version()
    server_serie =version_info.get('server_serie')
    if server_serie!='17.0':
        raise UserError('Not support Odoo found.')
    return True