# -*- coding: utf-8 -*-
#################################################################################
#
#   Copyright (c) 2015-Present Webkul Software Pvt. Ltd. (<https://webkul.com/>)
#   See LICENSE file for full copyright and licensing details.
#################################################################################
from odoo import models
    
class PosSession(models.Model):
    _inherit = "pos.session"
    
    def _loader_params_medicine_manufacturer(self):
        return { "search_params": { "fields" : ['name', 'parent_id'] }}

    def _get_pos_ui_medicine_manufacturer(self, params):
        return self.env["medicine.manufacturer"].search_read(**params["search_params"])
    
    def _loader_params_basic_salt(self):
        return { "search_params": { "fields" : ['name'] }}

    def _get_pos_ui_basic_salt(self, params):
        return self.env["basic.salt"].search_read(**params["search_params"])
    
    def _loader_params_salt_unit(self):
        return { "search_params": { "fields" : ['salt_unit'] }}

    def _get_pos_ui_salt_unit(self, params):
        return self.env["salt.unit"].search_read(**params["search_params"])
    
    def _loader_params_medicine_salt(self):
        return { "search_params": { "fields" : ['name', 'salt', 'qty', 'unit', 'medicine_salt_ids'] }}

    def _get_pos_ui_medicine_salt(self, params):
        return self.env["medicine.salt"].search_read(**params["search_params"])

    def _loader_params_salt_composition(self):
        return { "search_params": { "fields" : ['name', 'medicine_salt_ids', 'salt_composition_ids'] }}

    def _get_pos_ui_salt_composition(self, params):
        return self.env["salt.composition"].search_read(**params["search_params"])
    
    def _loader_params_medicine_usage(self):
        return { "search_params": { "fields" : ['name', 'medicine_usage'] }}

    def _get_pos_ui_medicine_usage(self, params):
        return self.env["medicine.usage"].search_read(**params["search_params"])
    
    def _loader_params_side_effects(self):
        return { "search_params": { "fields" : ['name', 'side_effects'] }}

    def _get_pos_ui_side_effects(self, params):
        return self.env["side.effects"].search_read(**params["search_params"])
    
    def _loader_params_safety_advice(self):
        return { "search_params": { "fields" : ['name', 'safety_advice'] }}

    def _get_pos_ui_safety_advice(self, params):
        return self.env["safety.advice"].search_read(**params["search_params"])
    
    def _loader_params_chemical_class(self):
        return { "search_params": { "fields" : ['name'] }}

    def _get_pos_ui_chemical_class(self, params):
        return self.env["chemical.class"].search_read(**params["search_params"])
    
    def _loader_params_therapeutic_class(self):
        return { "search_params": { "fields" : ['name'] }}

    def _get_pos_ui_therapeutic_class(self, params):
        return self.env["therapeutic.class"].search_read(**params["search_params"])
    
    def _loader_params_action_class(self):
        return { "search_params": { "fields" : ['name'] }}

    def _get_pos_ui_action_class(self, params):
        return self.env["action.class"].search_read(**params["search_params"])

    def _loader_params_fact_box(self):
        return { "search_params": { "fields" : ['habit_forming', 'chemical_class', 'therapeutic_class', 'action_class'] }}

    def _get_pos_ui_fact_box(self, params):
        return self.env["fact.box"].search_read(**params["search_params"])

    def _loader_params_product_uom_price(self):
        return { "search_params": { "fields" : ['uom_id', 'qty', 'unit_price','price'] }}

    def _get_pos_ui_product_uom_price(self, params):
        return self.env["product.uom.price"].search_read(**params["search_params"])
    
    def _loader_params_uom_category(self):
        return { "search_params": { "fields" : ['name', 'is_medicine'] }}

    def _get_pos_ui_uom_category(self, params):
        return self.env["uom.category"].search_read(**params["search_params"])
    
    def _loader_params_product_product(self):
        result = super()._loader_params_product_product()
        result['search_params']['fields'].extend(['manufacturer_id', 'storage', 'medicine_substitute_ids','medicine_search_term', 'is_pharma_product', 'is_medicine', 'is_prescription','salt_composition_ids', 'medicine_salt_ids', 'medicine_usage_ids', 'side_effects_ids', 'safety_advice_ids', 'fact_box_ids', 'salt_ids', 'manage_multi_uom_via_price', 'product_price_by_uom'])
        return result  
    
    def _loader_params_res_partner(self):
        result = super()._loader_params_res_partner()
        result['search_params']['fields'].append('is_a_doctor')
        return result  

    def _pos_ui_models_to_load(self):
        models = super()._pos_ui_models_to_load()
        models_to_load = ["uom.uom", "uom.category","medicine.manufacturer", "basic.salt", "salt.unit", "medicine.salt", "salt.composition", "medicine.usage", "side.effects", "safety.advice", "chemical.class", "therapeutic.class", "action.class", "fact.box", "product.uom.price"]
        for model in models_to_load:
            if model not in models:
                models.append(model) 
        return models
    
    def getStocks(self, config_id, product_id):
        config = self.env['pos.config'].search([('id', '=', config_id)])
        location_id = config.picking_type_id.default_location_src_id.id
        stocks = self.env['stock.quant'].search_read(fields=['lot_id', 'location_id', 'quantity'], domain=[('product_id', '=', product_id), ('location_id', '=', location_id)])
        for stock in stocks:
            if(stock['lot_id']):
                lot = self.env['stock.lot'].search([('id', '=', stock['lot_id'][0])])
                if lot : stock['expiration_date'] = lot.expiration_date
        return stocks
