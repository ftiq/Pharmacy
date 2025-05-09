/** @odoo-module */

import { patch } from "@web/core/utils/patch";
import { PosStore } from "@point_of_sale/app/store/pos_store";
import { ToppingsPopup } from "@sh_pos_all_in_one_retail/static/sh_pos_product_toppings/app/Popups/ToppingsPopup/ToppingsPopup";

patch(PosStore.prototype, {
    //@override
    async addProductToCurrentOrder(product, options = {}) {
        var self = this;
        await super.addProductToCurrentOrder(product, options = {})
        var category;
        var product_ids = []
        var Topping_products = []

        if (product.pos_categ_id && product.pos_categ_id[0]) {
            category = self.db.get_category_by_id(product.pos_categ_id[0])
        }

        if (category && category.sh_product_topping_ids) {
            category.sh_product_topping_ids.forEach(function (product_id) {
                if(self.db.product_by_id[product_id]){
                    Topping_products.push(self.db.product_by_id[product_id])
                    product_ids.push(product_id)
                }
            });
        }

        await product.sh_topping_ids.forEach(function (each_id) {
            if (!product_ids.includes(each_id)) {
                if(self.db.product_by_id[each_id]){
                    Topping_products.push(self.db.product_by_id[each_id])
                }
            }
        });

        var allproducts = []
        if (!self.isMobile && $('.search-box input') && $('.search-box input').val() != "") {
            allproducts = this.db.search_product_in_category(
                self.selectedCategoryId,
                $('.search-box input').val()
            );
        } else {
            allproducts = self.db.get_product_by_category(0);
        }


        if (self.config.sh_add_toppings_on_click_product && self.config.sh_enable_toppings) {
            if (Topping_products.length > 0) {
                let { confirmed } = await  this.popup.add(ToppingsPopup, {'title' : 'Toppings','Topping_products': Topping_products, 'Globaltoppings': []});
                if (confirmed) {
                } else {
                    return;
                }
            }
        }
    }
});
