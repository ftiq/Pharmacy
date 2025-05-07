/** @odoo-module */
/* (C) 2025 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com */

import { patch } from "@web/core/utils/patch";
import { MedicineProductInfoPopup } from "@pos_pharmacy_management/app/popup/medicine_product_info_popup/medicine_product_info_popup";
import { AlternateMedicinePopup } from "@pos_pharmacy_management/app/popup/alternate_medicine_popup/alternate_medicine_popup";

patch(MedicineProductInfoPopup.prototype, {
    onAlternateMedicineClick(product) {
        this.cancel();
        this.popup.add(AlternateMedicinePopup, {product : product, med_ids : product.medicine_substitute_ids});
    },

    async onSaltBasedProductsClick(product) {
        var list = this.pos.db.get_product_by_category(this.pos.selectedCategoryId);
        var med_ids = [];
        list.forEach(prod => {
            const found = prod.salt_composition_ids.find(id => product.salt_composition_ids.includes(id));

            if (found) {
                med_ids.push(prod.id);
            }
        });
        med_ids = [...new Set(med_ids)];
        this.cancel();
        this.popup.add(AlternateMedicinePopup, { product: product, med_ids: med_ids });
    }
});