/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { Order, Orderline } from "@point_of_sale/app/store/models";

patch(Order.prototype, {
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        var doctor;
        if (json.doctor) {
            doctor = this.pos.db.get_partner_by_id(json.doctor);
            if (!doctor) console.error("ERROR: trying to load a doctor not available in the pos");
        } else doctor = null;
        this.set_doctor(doctor);
    },
    export_as_JSON (){
        var json = super.export_as_JSON(...arguments);
        json.doctor = this.get_doctor() ? this.get_doctor().id : false;
        return json;
    },
    get_doctor(){
        return this.doctor;
    },
    set_doctor(doctor){
        this.doctor = doctor;
    }
});

patch(Orderline.prototype, {
    init_from_JSON(json) {
        super.init_from_JSON(...arguments);
        this.uom_id = json.uom_id;
    },
    export_as_JSON (){
        var json = super.export_as_JSON(...arguments);
        if(this.uom_id) json.uom_id = this.uom_id;
        return json;
    },
    getDisplayData() {
        return {
            id: this.id,
            productName: this.get_full_product_name(),
            price: this.env.utils.formatCurrency(this.get_display_price()),
            qty: this.get_quantity_str(),
            unit: this.get_unit().name,
            unitPrice: this.env.utils.formatCurrency(this.get_unit_display_price()),
            oldUnitPrice: this.env.utils.formatCurrency(this.get_old_unit_display_price()),
            discount: this.get_discount_str(),
            customerNote: this.get_customer_note(),
            internalNote: this.getNote(),
            comboParent: this.comboParent?.get_full_product_name(),
            imageUrl: this.get_product().getImageUrl(),
            is_medicine: this.get_product().is_medicine,
            product: this.get_product(),
            is_refund: this.hasOwnProperty('refunded_qty'),
        };
    }
});