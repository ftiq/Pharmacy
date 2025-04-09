/** @odoo-module */
/* (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com */
/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import { patch } from "@web/core/utils/patch";
import { Product } from "@point_of_sale/app/store/models";
import { Order, Orderline } from "@point_of_sale/app/store/models";
import { ConfirmPopup } from "@point_of_sale/app/utils/confirm_popup/confirm_popup";
import { _t } from "@web/core/l10n/translation";

patch(Order.prototype, {

    async pay() {
        if (!this.canPay()) {
            return;
        }
        let orderlines = this.pos.selectedOrder.orderlines
        for (let line of orderlines) {
            let { uom_line, price, full_product_name, product } = line;
            let product_price = 0;
            let product_standard_price = 0;
             product_price = price;
             product_standard_price = product.standard_price;
            if (uom_line) {
                const uom = this.pos.units.find(unit => unit.id === uom_line.uom_id[0]);
                if (!uom) throw new Error('UOM not found');
                const { ratio: uomRatio, uom_type: uomType } = uom;
                const uomCategory = this.pos.uom_categories[uom.category_id[0]];
                if (!uomCategory) throw new Error('UOM Category not found');
                const referenceUom = this.pos.units.find(unit => uomCategory.uom_ids.includes(unit.id) && unit.uom_type === 'reference');
                if (!referenceUom) throw new Error('Reference UOM not found');
                const referenceUomRatio = referenceUom.ratio;
                if (uomType === 'smaller') {
                    product_price = (referenceUomRatio / uomRatio) * price;
                    product_standard_price = (referenceUomRatio / uomRatio) * product.standard_price;
                } else if (uomType === 'bigger') {
                    product_price = (referenceUomRatio / uomRatio) * price;
                    product_standard_price = (referenceUomRatio / uomRatio) * product.standard_price;
                }
            }
            let totalPrice = product_price * line.quantity;
            let costPrice = product_standard_price * line.quantity;
            if (costPrice > totalPrice) {
                const { confirmed } = await this.env.services.popup.add(ConfirmPopup, {
                    title: 'Alert',
                    body: `The sales price of ${product_price} for the product ${full_product_name} is lower than its cost price.`,
                });
            }
        }
        if (
            this.orderlines.some(
                (line) => line.get_product().tracking !== "none" && !line.has_valid_product_lot()
            ) &&
            (this.pos.picking_type.use_create_lots || this.pos.picking_type.use_existing_lots)
        ) {
            const { confirmed } = await this.env.services.popup.add(ConfirmPopup, {
                title: _t("Some Serial/Lot Numbers are missing"),
                body: _t(
                    "You are trying to sell products with serial/lot numbers, but some of them are not set.\nWould you like to proceed anyway?"
                ),
                confirmText: _t("Yes"),
                cancelText: _t("No"),
            });
            if (confirmed) {
                this.pos.mobile_pane = "right";
                this.env.services.pos.showScreen("PaymentScreen");
            }
        } else {
            this.pos.mobile_pane = "right";
            this.env.services.pos.showScreen("PaymentScreen");
        }
    }

});

patch(Orderline.prototype, {

    setup(_defaultObj, options) {
        super.setup(...arguments);
        this.uom_qty_line = 1;
    },

    set_uom_qty_line(qty) {
        this.uom_qty_line = qty;
    },

    export_as_JSON() {
        var json = super.export_as_JSON(...arguments);
        json.uom_line_details = this.uom_line;
        return json;
    },

    getDisplayData() {
        return {
            ...super.getDisplayData(),
            uom_qty_line: this.uom_qty_line,
        };
    },

    get_required_number_of_lots() {
        var lots_required = 1;

        if (this.product.tracking == "serial") {
            lots_required = Math.abs(this.quantity);
        }

        return lots_required;
    },

    async editPackLotLines() {
        const isAllowOnlyOneLot = this.product.isAllowOnlyOneLot();
        const editedPackLotLines = await this.pos.getEditedPackLotLines(
            isAllowOnlyOneLot,
            this.getPackLotLinesToEdit(isAllowOnlyOneLot),
            this.product.display_name
        );
        if (!editedPackLotLines) {
            return;
        }
        this.setPackLotLines(editedPackLotLines);
        this.order.select_orderline(this);
    }

});

patch(Product.prototype, {

    async getAddProductOptions(code) {
        let price_extra = 0.0;
        let draftPackLotLines, packLotLinesToEdit, attribute_value_ids;
        let quantity = 1;
        let comboLines = [];
        let attribute_custom_values = {};

        if (code && this.pos.db.product_packaging_by_barcode[code.code]) {
            quantity = this.pos.db.product_packaging_by_barcode[code.code].qty;
        }

        if (this.isConfigurable()) {
            const { confirmed, payload } = await this.openConfigurator({ initQuantity: quantity });
            if (confirmed) {
                attribute_value_ids = payload.attribute_value_ids;
                attribute_custom_values = payload.attribute_custom_values;
                price_extra += payload.price_extra;
                quantity = payload.quantity;
            } else {
                return;
            }
        }
        if (this.combo_ids.length) {
            const { confirmed, payload } = await this.env.services.popup.add(
                ComboConfiguratorPopup,
                { product: this, keepBehind: true }
            );
            if (!confirmed) {
                return;
            }
            comboLines = payload;
        }
        // Gather lot information if required.
        if (this.isTracked()) {
            packLotLinesToEdit =
                (!this.isAllowOnlyOneLot() &&
                    this.pos.selectedOrder
                        .get_orderlines()
                        .filter((line) => !line.get_discount())
                        .find((line) => line.product.id === this.id)
                        ?.getPackLotLinesToEdit()) ||
                [];
            // if the lot information exists in the barcode, we don't need to ask it from the user.
            if (code && code.type === "lot") {
                // consider the old and new packlot lines
                const modifiedPackLotLines = Object.fromEntries(
                    packLotLinesToEdit.filter((item) => item.id).map((item) => [item.id, item.text])
                );
                const newPackLotLines = [{ lot_name: code.code }];
                draftPackLotLines = { modifiedPackLotLines, newPackLotLines };
            } else {
                const { list_lot_num } = this.pos;
                const productId = this.id;
                const list_lot_num_product = list_lot_num.filter(({ product_id, total_qty }) => product_id[0] === productId && total_qty !== 0);

                if (list_lot_num_product.length === 1) {
                    draftPackLotLines = {
                        modifiedPackLotLines: {},
                        newPackLotLines: [{ lot_name: list_lot_num_product[0].name, prod_qty: 1 }]
                    };
                } else {
                    draftPackLotLines = await this.pos.getEditedPackLotLines(
                        this.isAllowOnlyOneLot(),
                        packLotLinesToEdit,
                        this.display_name
                    );
                }
            }
            if (!draftPackLotLines) {
                return;
            }
        }

        // Take the weight if necessary.
        if (this.to_weight && this.pos.config.iface_electronic_scale) {
            // Show the ScaleScreen to weigh the product.
            if (this.isScaleAvailable) {
                const product = this;
                const { confirmed, payload } = await this.env.services.pos.showTempScreen(
                    "ScaleScreen",
                    {
                        product,
                    }
                );
                if (confirmed) {
                    quantity = payload.weight;
                } else {
                    // do not add the product;
                    return;
                }
            } else {
                await this._onScaleNotAvailable();
            }
        }

        if(draftPackLotLines && (draftPackLotLines.modifiedPackLotLines || draftPackLotLines.newPackLotLines)){
            quantity = undefined;
        }

        return {
            draftPackLotLines,
            quantity,
            attribute_custom_values,
            price_extra,
            comboLines,
            attribute_value_ids,
        };
    }

});
