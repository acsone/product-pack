/* Copyright 2026 ACSONE SA/NV */
import {_t} from "@web/core/l10n/translation";
import {AlertDialog} from "@web/core/confirmation_dialog/confirmation_dialog";
import {patch} from "@web/core/utils/patch";
import {StaticList} from "@web/model/relational_model/static_list";

patch(StaticList.prototype, {
    _getRecordIdentifier(record) {
        return record.resId || record.id;
    },

    _isSaleOrderLine(record) {
        return record.resModel === "sale.order.line";
    },

    _isPackChildRecord(record) {
        return (
            this._isSaleOrderLine(record) && Boolean(record.data.pack_parent_line_id)
        );
    },

    _isNonModifiablePackParent(record) {
        return (
            this._isSaleOrderLine(record) &&
            !record.data.pack_parent_line_id &&
            !record.data.pack_modifiable
        );
    },

    _getHiddenPackParentIds() {
        if (!this._hiddenPackParentIds) {
            this._hiddenPackParentIds = new Set();
        }
        return this._hiddenPackParentIds;
    },

    _hidePackChildrenForParent(record) {
        if (!this._isNonModifiablePackParent(record)) {
            return;
        }
        const parentId = this._getRecordIdentifier(record);
        if (parentId) {
            this._getHiddenPackParentIds().add(parentId);
        }
    },

    _isHiddenPackChild(record) {
        if (!this._isPackChildRecord(record)) {
            return false;
        }
        const hiddenParentIds = this._getHiddenPackParentIds();
        if (!hiddenParentIds.size) {
            return false;
        }
        const parentId = record.data.pack_parent_line_id[0];
        return hiddenParentIds.has(parentId);
    },

    get records() {
        const records = super.records;
        if (records.isArray) {
            return records.filter((record) => !this._isHiddenPackChild(record));
        }
        return records;
    },

    _canBeDeleted(record) {
        return this._isPackChildRecord(record) && !record.data.pack_modifiable;
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
        this._hidePackChildrenForParent(record);
        return super.delete(...arguments);
    },

    async deleteRecords(records) {
        if (records.some((record) => this._canBeDeleted(record))) {
            this._alertNotUnlinkable(true);
            return;
        }
        for (const record of records) {
            this._hidePackChildrenForParent(record);
        }
        return super.deleteRecords(...arguments);
    },
});
