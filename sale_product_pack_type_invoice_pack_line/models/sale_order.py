# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

from odoo import models


class SaleOrder(models.Model):

    _inherit = "sale.order"

    def _get_invoiceable_lines(self, final=False):
        """Don't take into account lines that have a parent product pack
        and the dont_invoice_pack_lines field to True.
        """
        lines = super()._get_invoiceable_lines(final=final)
        return lines.filtered(
            lambda line: not line.pack_parent_line_id
            or (
                line.pack_parent_line_id.product_id.pack_type_id
                and not line.pack_parent_line_id.product_id.pack_type_id.dont_invoice_pack_lines
            )
        )
