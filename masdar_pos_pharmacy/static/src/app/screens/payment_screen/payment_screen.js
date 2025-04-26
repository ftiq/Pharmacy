/** @odoo-module */
/* (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com */
/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import { PaymentScreen } from "@point_of_sale/app/screens/payment_screen/payment_screen";
import { patch } from "@web/core/utils/patch";

patch(PaymentScreen.prototype, {

    async validateOrder(isForceValidate) {
	    alert("isForceValidate");
		var self = this;
		var order = this.pos.get_order();
		var orderline = order.get_orderlines();
		var lot_list = this.pos.list_lot_num;
		var lotIndex = lot_list.reduce((acc, lot) => {
            if (!acc[lot.product_id[0]]) {
                acc[lot.product_id[0]] = {};
            }
            acc[lot.product_id[0]][lot.name] = lot;
            return acc;
        }, {});
		orderline.forEach(line => {
            if (line.pack_lot_lines && line.pack_lot_lines.length > 0) {
                line.pack_lot_lines.forEach(lot => {
                    let productLots = lotIndex[line.product.id];
                    if (line.uom_line && productLots && productLots[lot.lot_name]) {
                        let d_lot = productLots[lot.lot_name];
                        try {
                            let adjustedQty = line.quantity;
                            if (line.uom_line) {
                                const uom = this.pos.units.find(unit => unit.id === line.uom_line.uom_id[0]);
                                if (!uom) throw new Error('UOM not found');
                                const { ratio: uomRatio, uom_type: uomType } = uom;
                                const uomCategory = Object.values(this.pos.uom_categories).find(category => category.id === uom.category_id[0]);
                                if (!uomCategory) throw new Error('UOM Category not found');
                                const uomCategoryUomIds = uomCategory.uom_ids;
                                const referenceUom = this.pos.units.find(unit => uomCategoryUomIds.includes(unit.id) && unit.uom_type === 'reference');
                                if (!referenceUom) throw new Error('Reference UOM not found');
                                const referenceUomRatio = referenceUom.ratio;
                                if (uomType === 'smaller') {
                                    adjustedQty = (referenceUomRatio / uomRatio) * line.quantity;
                                } else if (uomType === 'bigger') {
                                    adjustedQty = (referenceUomRatio * uomRatio) * line.quantity;
                                }
                            }
                            d_lot.total_qty -= (adjustedQty - 1);
                        } catch (error) {
                            console.error('Error processing adjusted Qty:', error);
                        }
                    } else {
                        let d_lot = productLots[lot.lot_name];
                        d_lot.total_qty -= line.quantity - 1;
                    }
                });
            }
        });
        if (this.pos.config.sh_display_stock) {
            if (orderline && orderline.length) {
                for (let line of orderline) {
                    const productId = line.get_product().id;
                    const stockList = this.pos.db.get_stock_by_product_id(productId);
                    const lot = this.pos.list_lot_num.find(lot => lot.name === line.pack_lot_lines[0].lot_name);
                    const lotId = lot ? lot.id : null;
                    const stockLocationIds = Object.values(this.pos.stock_location)
                        .filter(location => location.usage === 'internal')
                        .map(location => location.id);
                    const stockQuant = Object.values(this.pos.stock_quant).find(quant => stockLocationIds.includes(quant.location_id[0]) && quant.lot_id[0] === lotId );
                    const resStockList = stockList.find(stock => stock.id === stockQuant?.id && stock.location_id === stockQuant?.location_id[0]);
                    if (resStockList) {
                        try {
                            let adjustedQty = line.quantity;
                            if (line.uom_line) {
                                const uom = this.pos.units.find(unit => unit.id === line.uom_line.uom_id[0]);
                                if (!uom) throw new Error('UOM not found');
                                const { ratio: uomRatio, uom_type: uomType } = uom;
                                const uomCategory = Object.values(this.pos.uom_categories).find(category => category.id === uom.category_id[0]);
                                if (!uomCategory) throw new Error('UOM Category not found');
                                const uomCategoryUomIds = uomCategory.uom_ids;
                                const referenceUom = this.pos.units.find(unit => uomCategoryUomIds.includes(unit.id) && unit.uom_type === 'reference');
                                if (!referenceUom) throw new Error('Reference UOM not found');
                                const referenceUomRatio = referenceUom.ratio;
                                if (uomType === 'smaller') {
                                    adjustedQty = (referenceUomRatio / uomRatio) * line.quantity;
                                } else if (uomType === 'bigger') {
                                    adjustedQty = (referenceUomRatio * uomRatio) * line.quantity;
                                }
                            }
                            resStockList['quantity']-= adjustedQty;
                        } catch (error) {
                            console.error('Error processing adjusted Qty:', error);
                        }
                    }
                }
            }
        }
		super.validateOrder(isForceValidate);
	},

});

