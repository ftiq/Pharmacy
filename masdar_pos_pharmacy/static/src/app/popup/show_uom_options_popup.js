/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { ShowUomOptionsPopup } from "@pos_pharmacy_management/app/popup/show_uom_options_popup/show_uom_options_popup";
import { DisplayMessageHigherQuantityLotPopup } from "@masdar_pos_pharmacy/app/popup/display_message_higher_quantity_lot_popup/display_message_higher_quantity_lot_popup";


patch(ShowUomOptionsPopup.prototype, {

    confirm(){
        var self = this;
        var line = self.pos.get_order().selected_orderline;
        var uom_line = line ? line.uom_line : null;
        const { pack_lot_lines, pos: { list_lot_num } } = line;
        const lotName = pack_lot_lines[0]?.lot_name;
        if (lotName && uom_line) {
            const lot = list_lot_num.find(lot => lot.name === lotName && uom_line.qty > lot.total_qty);
            if (lot) {
                this.env.services.popup.add(DisplayMessageHigherQuantityLotPopup, {
                title: 'Information',
                quantitylot: lot.total_qty,
                });
            }
        }
        if(line && uom_line){
            line.product.uom_id = uom_line.uom_id;
            line.set_uom_qty_line(uom_line.qty);
            line.set_quantity(1);
            line.set_unit_price(uom_line.unit_price);
        }
        this.cancel();
    }

});


