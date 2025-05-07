/** @odoo-module */
/* (C) 2024 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com */

import { patch } from "@web/core/utils/patch";
import { EditListPopup1 } from "@mai_pos_lotnumer_selection/js/EditListPopup1";
import { usePos } from "@point_of_sale/app/store/pos_hook";
import { useState } from "@odoo/owl";

patch(EditListPopup1.prototype, {

    setup() {
        super.setup();
        this.pos = usePos();
        const { stock_quant, stock_warehouse, config, list_lot_num, stock_location } = this.pos;
        const warehouse = stock_warehouse[config.warehouse_id?.[0]];
        const lot_stock_id = warehouse?.lot_stock_id?.[0];
        let parentLocation = false;
        const foundLocation = Object.values(stock_location).find(value => value.id === lot_stock_id);
        if (foundLocation) {
            parentLocation = foundLocation.location_id[0];
        }
        const resstockLocations = Object.values(stock_location)
            .filter(location => location.parent_path?.includes(`1/${parentLocation}/${lot_stock_id}`))
            .map(location => location.id);
        const stock_quant_lot = Object.values(stock_quant)
            .filter(quant => resstockLocations.includes(quant.location_id?.[0]) && quant.product_id?.[0] === this.props.product.id)
            .map(quant => quant.lot_id?.[0]);
        const product_lot = list_lot_num.filter(lot => stock_quant_lot.includes(lot.id));
        product_lot.forEach(product => {
            product.expiration_date_masdar_pos = product.expiration_date_masdar_pos.slice(0, 7);
        });
        this.state = useState({
            array: this._initialize(this.props.array) ,
            product_lot : product_lot ,
            qstr : ''
        });
        // useAutoFocusToLast();
    },

    addNewLotLine(lot_name){
        var self = this;
        let list_of_qty = $('.entered_item_qty');
        $.each(list_of_qty, function(index, value) {
            let entered_item_qty = $(value).find('input');
            let entered_qty = parseFloat(entered_item_qty.val());
            if(entered_item_qty.attr('data-lot') == lot_name){
                for(var i = 0 ; i < entered_qty ; i++){
                    self.state.array.push(
                        {text: lot_name,
                        qty : 1,
                        _id: self._nextId(),
                    });
                }
            }
        });
        this.confirmaddNewLotLine();
    },

    confirm() {
        const { product_lot } = this.state;
        const oldestProduct = product_lot.reduce((oldest, product) => {
            const productDate = new Date(product.expiration_date_masdar_pos);
            const oldestDate = new Date(oldest.expiration_date_masdar_pos);
            return productDate < oldestDate ? product : oldest;
        });
        const list_of_qty = $('.entered_item_qty');
        list_of_qty.each((index, value) => {
            const entered_item_qty = $(value).find('input');
            const entered_qty = parseFloat(entered_item_qty.val());
            if (entered_item_qty.attr('data-lot') === oldestProduct.name) {
                for (let i = 0; i < entered_qty; i++) {
                    this.state.array.push({
                        text: oldestProduct.name,
                        qty: 1,
                        _id: this._nextId(),
                    });
                }
            }
        });
        super.confirm();
    }
});


