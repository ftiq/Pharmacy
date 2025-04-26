/** @odoo-module */

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";

import { usePos } from "@point_of_sale/app/store/pos_hook";
import { patch } from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {
    setup() {
        super.setup();
        this.pos = usePos();
    },

    async validateOrder(isForceValidate) {
	    alert('alidateOrder(isForceValidate')
	    alert('C:\Program Files\manar\parmacy\Pharmacy\mai_pos_lotnumer_selection\static\src\js\PaymentScreenWidget.js')
		var self = this;
		var order = this.pos.get_order();
		var orderline = order.get_orderlines();
		var lot_list = this.pos.list_lot_num;
		orderline.forEach(function(line) {
			if(line.pack_lot_lines && line.pack_lot_lines.length > 0){
				line.pack_lot_lines.forEach(function(lot){
					lot_list.forEach(function(d_lot){
						if(line.product.id == d_lot.product_id[0] && d_lot.name == lot.lot_name){
							d_lot.total_qty = d_lot.total_qty - 1
						}
					});
				});
			}
		});
		super.validateOrder(isForceValidate);
	},	

});

