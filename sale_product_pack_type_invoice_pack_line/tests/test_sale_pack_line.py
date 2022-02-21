# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).
from odoo.tests import SavepointCase

from odoo.addons.product_pack_type.tests.common import ProductPackTypeCommon


class TestSalePackLine(ProductPackTypeCommon, SavepointCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        pricelist = cls.env["product.pricelist"].create(
            {
                "name": "Test",
                "company_id": cls.env.company.id,
                "item_ids": [
                    (
                        0,
                        0,
                        {
                            "applied_on": "3_global",
                            "compute_price": "formula",
                            "base": "list_price",
                        },
                    )
                ],
            }
        )
        cls.sale_order = cls.env["sale.order"].create(
            {
                "company_id": cls.env.company.id,
                "partner_id": cls.env.ref("base.res_partner_12").id,
                "pricelist_id": pricelist.id,
            }
        )

    def test_sale_invoice(self):
        # Create a pack type
        # Activate the option to ignore pack lines for invoicing
        # Confirm sale order
        # Create invoice
        # Check if there is only one invoice line
        # Check if the product on the invoice line is the pack one
        pack_type = self._create_type()
        pack_type.dont_invoice_pack_lines = True
        self.cpu_detailed.pack_type_id = pack_type
        self.cpu_detailed.pack_component_price = "ignored"
        self.env["sale.order.line"].create(
            {
                "order_id": self.sale_order.id,
                "name": self.cpu_detailed.name,
                "product_id": self.cpu_detailed.id,
                "product_uom_qty": 1,
            }
        )
        self.assertEqual(len(self.sale_order.order_line), 4)
        self.sale_order.action_confirm()
        invoice = self.sale_order._create_invoices()
        self.assertEqual(1, len(invoice.invoice_line_ids))
        self.assertEqual(self.cpu_detailed, invoice.invoice_line_ids.product_id)
        self.assertEqual(self.cpu_detailed.lst_price, invoice.amount_total)
