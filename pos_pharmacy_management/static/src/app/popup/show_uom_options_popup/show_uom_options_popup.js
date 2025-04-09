/** @odoo-module */

import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class ShowUomOptionsPopup extends AbstractAwaitablePopup {
    static template = "pos_pharmacy_management.ShowUomOptionsPopup";
    
    setup() {
        super.setup();
        this.pos = usePos();
    }
    async onShowUomClick(event, uom_id){
        var uom_line = this.pos.product_uom_price[uom_id];
        this.pos.get_order().selected_orderline['uom_line'] = uom_line;
        $(event.srcElement).parents('.uom_popup_body').find(`.active_uom`).removeClass("active_uom");
        $(event.srcElement).parents(`.uom_line[uom-id=${uom_id}]`).addClass("active_uom");
    }
    confirm(){
        var self = this;
        var line = self.pos.get_order().selected_orderline;
        var uom_line = line ? line.uom_line : null;
        if(line && uom_line){
            line.product.uom_id = uom_line.uom_id;
            line.set_quantity(uom_line.qty);
            line.set_unit_price(uom_line.unit_price);
        }
        this.cancel();
    }
}