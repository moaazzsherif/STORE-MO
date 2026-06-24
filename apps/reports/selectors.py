from django.db.models import Sum, F, Count
from django.utils import timezone
from apps.sales.models import Sale, SaleItem
from apps.inventory.models import Stock


class ReportSelectors:
    @staticmethod
    def get_sales_summary(start_datetime, end_datetime):
        """
        Aggregate sales statistics for a given date range.
        Respects tenant isolation context.
        """
        sales = Sale.objects.filter(
            created_at__gte=start_datetime,
            created_at__lte=end_datetime
        )
        
        aggregates = sales.aggregate(
            total_revenue=Sum('total_amount') or 0.0,
            total_tax=Sum('tax_amount') or 0.0,
            total_discount=Sum('discount_amount') or 0.0,
            invoice_count=Count('id')
        )
        
        return aggregates

    @staticmethod
    def get_profit_loss(start_datetime, end_datetime):
        """
        Calculate gross profit and loss margins.
        P&L = Total Sales Revenue - Cost of Goods Sold (COGS).
        """
        sale_items = SaleItem.objects.filter(
            sale__created_at__gte=start_datetime,
            sale__created_at__lte=end_datetime
        )
        
        # Calculate revenue and cost of goods sold
        revenue = sale_items.aggregate(
            total_sales=Sum('total_amount') or 0.0
        )['total_sales']
        
        # COGS = Sum(item.quantity * item.product_variant.cost)
        cogs = 0.0
        for item in sale_items.select_related('product_variant'):
            cogs += float(item.quantity * item.product_variant.cost)
            
        gross_profit = float(revenue) - cogs
        margin = (gross_profit / float(revenue) * 100) if revenue > 0 else 0.0
        
        return {
            'total_revenue': float(revenue),
            'cost_of_goods_sold': cogs,
            'gross_profit': gross_profit,
            'profit_margin_percentage': margin
        }

    @staticmethod
    def get_inventory_valuation():
        """
        Calculate total stock asset value.
        Valuation = Sum(Stock.quantity * ProductVariant.cost)
        """
        stocks = Stock.objects.select_related('product_variant').filter(quantity__gt=0)
        
        total_quantity = 0
        total_value = 0.0
        
        for stock in stocks:
            total_quantity += stock.quantity
            total_value += float(stock.quantity * stock.product_variant.cost)
            
        return {
            'total_stock_units': total_quantity,
            'total_asset_value': total_value
        }
