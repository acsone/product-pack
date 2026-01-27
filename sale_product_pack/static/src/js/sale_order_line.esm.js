/* Copyright 2026 ACSONE SA/NV */
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {_t} from "@web/core/l10n/translation";
import {patch} from "@web/core/utils/patch";
import {StaticList} from "@web/model/relational_model/static_list";

patch(StaticList.prototype, {
    _canBeDeleted(record) {
        return (
            record.resModel === "sale.order.line" &&
            record.data.pack_parent_line_id &&
            !record.data.pack_modifiable
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

    _deleteChildRecord(record) {
        for (const childLine of this.model.getRecords({
            domain: [["pack_parent_line_id", "=", record.id]],
        })) {
            childLine.delete(...arguments);
        }
    },

    _deleteChildRecords(records) {
        for (const record of records) {
            this._deleteChildRecord(record);
        }
    },

    async delete(record) {
        if (this._canBeDeleted(record)) {
            this._alertNotUnlinkable(false);
            return;
        }
        /* If authorized anf if this record is a packed product line, also delete existing child lines */
        this._deleteChildRecord(record);
        return super.delete(...arguments);
    },

    async deleteRecords(records) {
        if (records.some((record) => this._canBeDeleted(record))) {
            this._alertNotUnlinkable(true);
            return;
        }
        /* If authorized and if some of these records are packed product lines, also delete existing child lines */
        this._deleteChildRecords(records);
        return super.deleteRecords(...arguments);
    },
});
