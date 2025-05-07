/** @odoo-module */

import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";
import { usePos } from "@point_of_sale/app/store/pos_hook";

export class DisplayMessageHigherQuantityLotPopup extends AbstractAwaitablePopup {
    static template = "masdar_pos_pharmacy.DisplayMessageHigherQuantityLotPopup";
    
    setup() {
        super.setup();
        this.pos = usePos();
    }
}