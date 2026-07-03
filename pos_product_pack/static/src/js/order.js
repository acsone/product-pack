/** @odoo-module **/

import {patch} from "@web/core/utils/patch";
import {PosOrder} from "@point_of_sale/app/models/pos_order";

patch(PosOrder.prototype, {
    removeOrderline(line) {
        line.removePackLine();
        return super.removeOrderline(...arguments);
    },
});
