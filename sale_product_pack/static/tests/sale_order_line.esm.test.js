/** @odoo-module **/

import {StaticList} from "@web/model/relational_model/static_list";

QUnit.module("sale_product_pack", () => {
    function makeSaleChildRecord({packModifiable = false} = {}) {
        return {
            resModel: "sale.order.line",
            data: {
                pack_parent_line_id: [99, "Pack"],
                pack_modifiable: packModifiable,
            },
        };
    }

    QUnit.test("_canBeDeleted is true only for non-modifiable pack child", (assert) => {
        const context = {
            _isSaleOrderLine: StaticList.prototype._isSaleOrderLine,
            _isPackChildRecord: StaticList.prototype._isPackChildRecord,
        };

        assert.true(
            StaticList.prototype._canBeDeleted.call(
                context,
                makeSaleChildRecord({packModifiable: false})
            )
        );
        assert.false(
            StaticList.prototype._canBeDeleted.call(
                context,
                makeSaleChildRecord({packModifiable: true})
            )
        );
        assert.false(
            StaticList.prototype._canBeDeleted.call(context, {
                resModel: "sale.order.line",
                data: {pack_parent_line_id: false, pack_modifiable: false},
            })
        );
    });

    QUnit.test("delete on protected child opens warning dialog", async (assert) => {
        assert.expect(2);

        const context = {
            _isSaleOrderLine: StaticList.prototype._isSaleOrderLine,
            _isPackChildRecord: StaticList.prototype._isPackChildRecord,
            _canBeDeleted: StaticList.prototype._canBeDeleted,
            _alertNotUnlinkable: (isMultiple) => {
                assert.strictEqual(isMultiple, false);
            },
            deleteRecords: StaticList.prototype.deleteRecords,
        };

        await StaticList.prototype.delete.call(
            context,
            makeSaleChildRecord({packModifiable: false})
        );

        assert.ok(true, "delete resolves without calling super delete path");
    });

    QUnit.test(
        "deleteRecords on protected children opens multi warning",
        async (assert) => {
            assert.expect(1);

            const context = {
                _isSaleOrderLine: StaticList.prototype._isSaleOrderLine,
                _isPackChildRecord: StaticList.prototype._isPackChildRecord,
                _canBeDeleted: StaticList.prototype._canBeDeleted,
                _alertNotUnlinkable: (isMultiple) => {
                    assert.strictEqual(isMultiple, true);
                },
            };

            await StaticList.prototype.deleteRecords.call(context, [
                makeSaleChildRecord({packModifiable: false}),
                makeSaleChildRecord({packModifiable: false}),
            ]);
        }
    );
});
