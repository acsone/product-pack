# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

from odoo import fields, models


class ProductPackType(models.Model):

    _inherit = "product.pack.type"

    dont_invoice_pack_lines = fields.Boolean(
        help="Check this if you don't want to invoice pack lines."
    )
