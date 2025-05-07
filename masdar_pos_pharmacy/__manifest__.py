# -*- coding: utf-8 -*-
# (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com
# License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl).

{
    'name': 'MASDAR POS Pharmacy',
    'sequence': 0,
    'version': '17.0.0.0',
    'summary': """App made by elmekkaoui.brahim@gmail.com""",
    'author': 'EL MEKKAOUI BRAHIM',
    'license': 'LGPL-3',
    'category': '',
    'description': """"App made by by elmekkaoui.brahim@gmail.com""",
    'website': "elmekkaoui.brahim@gmail.com",
    'images': [],
    'depends': [
        'mai_pos_lotnumer_selection',
        'pos_pharmacy_management',
        'sh_pos_all_in_one_retail'
    ],
    'data': [
        # Views
        'views/res_config_settings_views.xml',
        'views/stock_move_line_views.xml',
        'views/stock_quant_views.xml',
    ],
    'demo': [
    ],
    'assets': {
        'point_of_sale._assets_pos': [
            'masdar_pos_pharmacy/static/src/app/popup/abstract_awaitable_popup.js',
            'masdar_pos_pharmacy/static/src/app/popup/EditListPopupMasdar.js',
            'masdar_pos_pharmacy/static/src/app/popup/show_uom_options_popup.js',
            'masdar_pos_pharmacy/static/src/app/store/models.js',
            'masdar_pos_pharmacy/static/src/app/store/pos_store.js',
            'masdar_pos_pharmacy/static/src/app/screens/product_screen/product_screen.js',
            'masdar_pos_pharmacy/static/src/app/screens/payment_screen/payment_screen.js',
            'masdar_pos_pharmacy/static/src/app/popup/display_message_higher_quantity_lot_popup/display_message_higher_quantity_lot_popup.js',
            'masdar_pos_pharmacy/static/src/app/popup/medicine_product_info_popup/medicine_product_info_popup.js',
            'masdar_pos_pharmacy/static/src/xml/point_of_sale.xml',
            'masdar_pos_pharmacy/static/src/app/generic_components/orderline/orderline.xml',
            'masdar_pos_pharmacy/static/src/app/screens/product_screen/product_screen.xml',
            'masdar_pos_pharmacy/static/src/app/popup/display_message_higher_quantity_lot_popup/display_message_higher_quantity_lot_popup.xml',
            'masdar_pos_pharmacy/static/src/overrides/screens/screens.xml',
            'masdar_pos_pharmacy/static/src/app/overrides/product_card/product_card.xml',
            'masdar_pos_pharmacy/static/src/app/popup/alternate_medicine_popup/alternate_medicine_popup.xml',
        ]
    },
    'installable': True,
    'application': False,
    'auto_install': False,
    'pre_init_hook':  "pre_init_check",
}
