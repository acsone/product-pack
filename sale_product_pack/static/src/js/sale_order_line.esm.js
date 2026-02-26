/* Copyright 2026 ACSONE SA/NV */
import {_t} from "@web/core/l10n/translation";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {StaticList} from "@web/model/relational_model/static_list";
import {patch} from "@web/core/utils/patch";

patch(StaticList.prototype, {
    _isSaleOrderLine(record) {
        return Boolean(record && record.resModel === "sale.order.line");
    },

    _isPackChildRecord(record) {
        return (
            this._isSaleOrderLine(record) &&
            Boolean(record.data && record.data.pack_parent_line_id)
        );
    },

    _canBeDeleted(record) {
        return (
            this._isPackChildRecord(record) &&
            !(record.data && record.data.pack_modifiable)
        );
    },

    _alertNotUnlinkable(isMultiple = false) {
        const body = isMultiple
            ? _t(
                  "Cannot delete these lines because they are part of a non-modifiable pack."
              )
            : _t(
                  "Cannot delete this line because it is part of a pack. Delete the pack itself."
              );

        this.model.env.services.dialog.add(AlertDialog, {
            title: _t("Deletion not allowed"),
            body: body,
        });
    },

    async delete(record) {
        if (this._canBeDeleted(record)) {
            this._alertNotUnlinkable(false);
            return;
        }
        return super.delete(record);
    },

    async deleteRecords(records) {
        if (!Array.isArray(records)) {
            if (super.deleteRecords) {
                return super.deleteRecords(...arguments);
            }
            return super.delete(records);
        }
        if (records.some((record) => this._canBeDeleted(record))) {
            this._alertNotUnlinkable(records.length > 1);
            return;
        }
        if (super.deleteRecords) {
            return super.deleteRecords(records);
        }
        for (const record of records) {
            await super.delete(record);
        }
    },
});
