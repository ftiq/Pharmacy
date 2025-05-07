/** @odoo-module */
/* (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com */
/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import { patch } from "@web/core/utils/patch";
import { ProductScreen } from "@point_of_sale/app/screens/product_screen/product_screen";
import { DisplayMessageHigherQuantityLotPopup } from "@masdar_pos_pharmacy/app/popup/display_message_higher_quantity_lot_popup/display_message_higher_quantity_lot_popup";


patch(ProductScreen.prototype, {

    _setValue(val) {
        const { numpadMode } = this.pos;
        const selectedLine = this.currentOrder.get_selected_orderline();
        if (selectedLine) {
            if (numpadMode === "quantity") {
                if (val === "remove") {
                    this.currentOrder.removeOrderline(selectedLine);
                } else {
                    const result = selectedLine.set_quantity(val);
                    const { uom_line, pack_lot_lines, quantity, pos: { list_lot_num } } = selectedLine;
                    const lotName = pack_lot_lines[0]?.lot_name;
                    let adjustedQty = 0;
                    let lot;
                    if (lotName) {
                        lot = list_lot_num.find(lot => lot.name === lotName);
                        if (lot) {
                            adjustedQty = lot.total_qty;
                        }
                    }
                    if (uom_line) {
                        const uom = this.pos.units.find(unit => unit.id === uom_line.uom_id[0]);
                        if (!uom) throw new Error('UOM not found');
                        const { ratio: uomRatio, uom_type: uomType } = uom;
                        const uomCategory = this.pos.uom_categories[uom.category_id[0]];
                        if (!uomCategory) throw new Error('UOM Category not found');
                        const referenceUom = this.pos.units.find(unit =>
                            uomCategory.uom_ids.includes(unit.id) && unit.uom_type === 'reference'
                        );
                        if (!referenceUom) throw new Error('Reference UOM not found');
                        const referenceUomRatio = referenceUom.ratio;
                        if (uomType === 'smaller') {
                            adjustedQty = (referenceUomRatio / uomRatio) * lot.total_qty;
                        } else if (uomType === 'bigger') {
                            adjustedQty = (referenceUomRatio * uomRatio) * lot.total_qty;
                        }
                    }
                    if (lotName && quantity > adjustedQty) {
                        this.env.services.popup.add(DisplayMessageHigherQuantityLotPopup, {
                            title: 'Information',
                            quantitylot: adjustedQty,
                        });
                    }
                    var selectedLine_uom_line = selectedLine ? selectedLine.uom_line : null;
                    if(selectedLine && selectedLine_uom_line){
                        selectedLine.set_unit_price(selectedLine_uom_line.unit_price);
                    }
                    if (!result) {
                        this.numberBuffer.reset();
                    }
                }
            } else if (numpadMode === "discount") {
                selectedLine.set_discount(val);
            } else if (numpadMode === "price") {
                selectedLine.price_type = "manual";
                selectedLine.set_unit_price(val);
            }
        }
    }

});