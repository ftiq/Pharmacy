/** @odoo-module */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { Order, Orderline } from "@point_of_sale/app/store/models";
import { _t } from "@web/core/l10n/translation";
import { EditListPopup1 } from "./EditListPopup1";
import { Product } from "@point_of_sale/app/store/models";

patch(PosStore.prototype, {

    constructor(obj) {
        super.PosStore(...arguments);
    },

    async _processData(loadedData) {
        await super._processData(...arguments);
        this.list_lot_num = loadedData['stock.lot'];
    },

    async getEditedPackLotLines(isAllowOnlyOneLot, packLotLinesToEdit, productName) {
        function getKeyByValue(object, value) {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    if (object[key]['display_name'] === value) {
                        return object[key];
                    }
                }
            }
            return null;
        }
        const product = getKeyByValue(this.db.product_by_id, productName);
        const { confirmed, payload } = await this.env.services.popup.add(EditListPopup1, {
            title: _t("Lot/Serial Number(s) Required"),
            name: productName,
            isSingleItem: isAllowOnlyOneLot,
            array: packLotLinesToEdit,
            product: product
        });
        if (!confirmed) {
            return;
        }
        // Segregate the old and new packlot lines
        const modifiedPackLotLines = Object.fromEntries(
            payload.newArray.filter((item) => item.id).map((item) => [item.id, item.text])
        );
        const newPackLotLines = payload.newArray
            .filter((item) => !item.id)
            .map((item) => ({ lot_name: item.text, prod_qty : item.qty }));

        return { modifiedPackLotLines, newPackLotLines };
    },
    
});


patch(Orderline.prototype, {

    export_as_JSON() {
        var json = super.export_as_JSON(...arguments);
        json.lot_details = this.get_order_line_lot();
        return json;
    },

    export_for_printing(){
        var pack_lot_ids = [];
        if (this.has_product_lot){
            this.pack_lot_lines.forEach(item => {
                return pack_lot_ids.push(item.export_as_JSON());
            });
        }
        var data = super.export_for_printing(...arguments);
        data.pack_lot_ids = pack_lot_ids;
        data.lot_details = this.get_order_line_lot();
        return data;
    },
    
    get_order_line_lot(){
        var pack_lot_ids = [];
        if (this.has_product_lot){

            this.pack_lot_lines.forEach(item => {
                return pack_lot_ids.push(item.export_as_JSON());
            });
        }
        return pack_lot_ids;
    },

    get_required_number_of_lots(){
        var lots_required = 1;
        if (this.product.tracking == 'serial' || this.product.tracking == 'lot') {
            lots_required = this.quantity;
        }
        return lots_required;
    },

});


patch(Product.prototype, {

    async getAddProductOptions(code) {
        let res = await super.getAddProductOptions(...arguments);
        if(res.draftPackLotLines && (res.draftPackLotLines.modifiedPackLotLines || res.draftPackLotLines.newPackLotLines)){
            res.quantity = undefined;
        }
        return res;
    },

});
