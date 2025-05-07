/** @odoo-module */
/* (C) 2025 EL MEKKAOUI BRAHIM : elmekkaoui.brahim@gmail.com */

import { patch } from "@web/core/utils/patch";
import { AbstractAwaitablePopup } from "@point_of_sale/app/popup/abstract_awaitable_popup";

patch(AbstractAwaitablePopup.prototype, {
    async confirmaddNewLotLine() {
        this.props.close({ confirmed: true, payload: await this.getPayload() });
    }
});