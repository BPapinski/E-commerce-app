# Generated by Django 5.0.14 on 2025-06-16 17:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("store", "0002_product_condition_product_seller"),
    ]

    operations = [
        migrations.AddField(
            model_name="cartitem",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
    ]
