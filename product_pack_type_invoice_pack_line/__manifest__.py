# Copyright 2022 ACSONE SA/NV
# License AGPL-3.0 or later (https://www.gnu.org/licenses/agpl).

{
    "name": "Product Pack Type Invoice Pack Line",
    "summary": """
        Allows to define an option on product pack types in order to define "
        "if pack lines should be on the invoice or not""",
    "version": "14.0.1.0.0",
    "license": "AGPL-3",
    "author": "ACSONE SA/NV,Odoo Community Association (OCA)",
    "website": "https://github.com/OCA/product-pack",
    "depends": [
        "product_pack_type",
    ],
    "data": ["views/product_pack_type.xml"],
}
