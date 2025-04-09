{
    'name': 'POS Lot/Serial Number(s) | POS Lot Selection(Community & Enterprise)',
    'version': '17.0.3.2.1',
    'category': 'Point of Sale',
    'summary': 'Using this module you can Search product using Lot/Serial numbers in Point of sale Interface, Add product Lot/Serial Numbers Expirydate and Option for print Lot/Serial number on POS Receipt.',
    'description': """ Using this module you can Search product using Lot/Serial numbers in Point of sale Interface, Add product Lot/Serial Numbers Expirydate and Option for print Lot/Serial number on POS Receipt.
    """,
    'price': 20,
    'currency': 'USD',
    "sequence": 1,
    "author" : "MAISOLUTIONSLLC",
    "email": 'apps@maisolutionsllc.com',
    "website":'http://maisolutionsllc.com/',
    'license': 'OPL-1',
    'depends': ['point_of_sale', 'product_expiry'],
    "live_test_url" : "https://youtu.be/0ChmqXGvm74",
    'data': [
        'views/point_of_sale.xml',
    ],
    'images': ['static/description/main_screenshot.gif'],
    'demo': [],
    'test': [],
    'installable': True,
    'auto_install': False,
    'assets': {
        'point_of_sale._assets_pos': [
            'mai_pos_lotnumer_selection/static/src/js/EditListPopup1.js',
            'mai_pos_lotnumer_selection/static/src/js/pos.js',
            'mai_pos_lotnumer_selection/static/src/js/PaymentScreenWidget.js',
            'mai_pos_lotnumer_selection/static/src/xml/point_of_sale.xml',
        ],        
    },      

}
