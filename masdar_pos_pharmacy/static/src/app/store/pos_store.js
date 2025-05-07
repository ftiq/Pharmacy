/** @odoo-module */
/* (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com */
/* License LGPL-3.0 or later (https://www.gnu.org/licenses/lgpl). */

import { PosStore } from "@point_of_sale/app/store/pos_store";
import { patch } from "@web/core/utils/patch";
import { _t } from "@web/core/l10n/translation";
import { EditListPopup1 } from "@mai_pos_lotnumer_selection/js/EditListPopup1";
import { ProductQtyPopup } from "@sh_pos_all_in_one_retail/static/sh_pos_wh_stock/app/popups/product_stock_popup/product_stock_popup";


patch(PosStore.prototype, {
    async _processData(loadedData) {
        await super._processData(...arguments);
        this._loadstockwarehouse(loadedData["stock.warehouse"]);
        this._loadstockquant(loadedData["stock.quant"]);
        this._loadstocklocation(loadedData["stock.location"]);
    },

    _loadstockwarehouse(result) {
        this.stock_warehouse = {};
        result.forEach(data => {
            this.stock_warehouse[data.id] = data
        });
    },

    _loadstockquant(result) {
        this.stock_quant = {};
        result.forEach(data => {
            this.stock_quant[data.id] = data
        });
    },

    _loadstocklocation(result) {
        this.stock_location = {};
        result.forEach(data => {
            this.stock_location[data.id] = data
        });
    },

    async getEditedPackLotLines(isAllowOnlyOneLot, packLotLinesToEdit, productName) {
        var self = this;
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
        async function getPayload(product_lot, productName, isAllowOnlyOneLot, packLotLinesToEdit) {
            if (product_lot.length > 1) {
                const { confirmed, payload } = await self.env.services.popup.add(EditListPopup1, {
                    title: _t("Lot/Serial Number(s) Required"),
                    name: productName,
                    isSingleItem: isAllowOnlyOneLot,
                    array: packLotLinesToEdit,
                    product: product
                });
                return confirmed ? payload : null;
            } else if (product_lot.length === 1) {
                return {
                    newArray: [
                        {
                            text: product_lot[0].name,
                            qty: 1,
                            _id: 2
                        }
                    ]
                };
            }
        }
        function segregatePackLotLines(newArray) {
            const modifiedPackLotLines = Object.fromEntries(
                newArray.filter((item) => item.id).map((item) => [item.id, item.text])
            );

            const newPackLotLines = newArray
                .filter((item) => !item.id)
                .map((item) => ({ lot_name: item.text, prod_qty: item.qty }));

            for (const key in modifiedPackLotLines) {
                if (Object.hasOwnProperty.call(modifiedPackLotLines, key)) {
                    delete modifiedPackLotLines[key];
                }
            }

            return { modifiedPackLotLines, newPackLotLines };
        }

        const product = getKeyByValue(this.db.product_by_id, productName);
        product.uom_id = product.uom_id_origin
        const { stock_quant, stock_warehouse, config, list_lot_num, stock_location } = this;
        const lot_stock_id = stock_warehouse[config.warehouse_id[0]]?.lot_stock_id?.[0];
        let parentLocation = false;
        const foundLocation = Object.values(stock_location).find(value => value.id === lot_stock_id);
        if (foundLocation) {
            parentLocation = foundLocation.location_id[0];
        }
        const resstockLocations = Object.values(stock_location)
            .filter(location => location.parent_path?.includes(`1/${parentLocation}/${lot_stock_id}`))
            .map(location => location.id);
        const stock_quant_lot = Object.values(stock_quant)
            .filter(quant => resstockLocations.includes(quant.location_id?.[0]) && quant.product_id?.[0] === product.id)
            .map(quant => quant.lot_id?.[0]);
        const product_lot = list_lot_num.filter(lot => stock_quant_lot.includes(lot.id) && lot.total_qty !== 0);
        const payload = await getPayload(product_lot, productName, isAllowOnlyOneLot, packLotLinesToEdit);

        if (!payload) return;

        if (payload.newArray.length && this.list_lot_num.some(lot => lot.name === payload.newArray[0].text && lot.total_qty < 0)) {
            return;
        }

        return segregatePackLotLines(payload.newArray);
    },

    async showStock(id) {
        event.stopPropagation()
        var stocks = this.db.get_stock_by_product_id(id)
        var TotalQty = 0.00
        if (stocks) {
            let Qtylst = stocks.map((stock) => stock.quantity)
            TotalQty = Qtylst.reduce((qty, next) => qty + next, 0);
        }
        var warehouse_by_id = {}
        if(stocks && stocks.length){
            if (this.config.sh_display_by == "warehouse") {
                for (let stock of stocks) {
                    if (stock.warehouse_id in warehouse_by_id) {
                        warehouse_by_id[stock.warehouse_id]['quantity'] += stock.quantity
                    } else {
                        warehouse_by_id[stock.warehouse_id] = { 'quantity': stock.quantity, 'name': stock.warehouse_name }
                    }
                }
                for (let w_id of Object.values(warehouse_by_id)) {
                    w_id['quantity'] = w_id['quantity'].toFixed(2)
                }
                this.env.services.popup.add(ProductQtyPopup, {
                    title: _t("Product Stock"),
                    'product_stock': Object.values(warehouse_by_id),
                    'TotalQty': TotalQty.toFixed(2)
                });
            } else {
                this.env.services.popup.add(ProductQtyPopup, {
                    title: _t("Product Stock"),
                    'product_stock': stocks,
                    'TotalQty': TotalQty.toFixed(2)
                });
            }
        }else{
            await this.env.services.popup.add(ErrorPopup, {
                title: "Stock Warning",
                body: "Product has no stock !",
            });
        }
    },
});



