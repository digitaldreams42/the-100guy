// lib/analytics-service.js
// This service will handle analytics calculations and data processing

// Calculate basic store analytics
export const calculateStoreAnalytics = async (salesData, productsData, subscriberData) => {
    // Calculate basic metrics - adjust to match the actual sales data structure
    const totalRevenue = salesData.reduce((sum, sale) => {
        // Sale record likely has item price as 'productPrice' or similar
        return sum + (sale.productPrice || sale.amount || sale.price || 0);
    }, 0);

    const totalSales = salesData.length;
    const totalSubscribers = subscriberData ? subscriberData.length : 0;
    const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Calculate top selling products based on actual sales data structure
    const productSalesCount = {};

    // Based on the sales API, sales have 'productId' field
    salesData.forEach(sale => {
        const productId = sale.productId;

        if (productSalesCount[productId]) {
            productSalesCount[productId]++;
        } else {
            productSalesCount[productId] = 1;
        }
    });

    // Get top selling products
    const topSellingProducts = Object.entries(productSalesCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([productId, count]) => {
            const product = productsData.find(p => p.id === productId);
            return {
                id: productId,
                name: product ? product.name : `Product ${productId}`,
                salesCount: count
            };
        });

    // Calculate revenue by product type
    const revenueByType = {};
    salesData.forEach(sale => {
        // Try to match product from sale data - could be embedded or referenced
        const product = productsData.find(p => p.id === sale.productId);
        const type = product ? product.type : 'Unknown';

        if (revenueByType[type]) {
            revenueByType[type] += (sale.productPrice || sale.amount || sale.price || 0);
        } else {
            revenueByType[type] = (sale.productPrice || sale.amount || sale.price || 0);
        }
    });

    // Calculate sales by date (for trending) - convert Firestore timestamp properly
    const salesByDate = {};
    salesData.forEach(sale => {
        // Convert Firestore timestamp to date string
        let dateStr;
        if (sale.createdAt && typeof sale.createdAt === 'string') {
            // Already converted to string
            dateStr = new Date(sale.createdAt).toDateString();
        } else if (sale.createdAt && typeof sale.createdAt.toDate === 'function') {
            // Firestore timestamp object
            dateStr = sale.createdAt.toDate().toDateString();
        } else if (sale.createdAt) {
            // Regular date string
            dateStr = new Date(sale.createdAt).toDateString();
        } else {
            // Fallback to current date
            dateStr = new Date().toDateString();
        }

        if (salesByDate[dateStr]) {
            salesByDate[dateStr]++;
        } else {
            salesByDate[dateStr] = 1;
        }
    });

    // Calculate conversion rate (simplified - comparing visitors to purchases)
    // In a real implementation, we would have visitor data
    const conversionRate = 2.5; // Placeholder - in real app this would be calculated from visitor data

    return {
        totalRevenue,
        totalSales,
        totalSubscribers,
        avgOrderValue,
        topSellingProducts,
        revenueByType,
        salesByDate,
        conversionRate
    };
};

// Get analytics for a specific period
export const getPeriodAnalytics = (salesData, period = 'week') => {
    const now = new Date();
    let startDate;

    switch(period) {
        case 'day':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 1);
            break;
        case 'week':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setDate(now.getDate() - 30);  // More accurate than month for consistent periods
            break;
        case 'year':
            startDate = new Date(now);
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate = new Date(0); // All time
    }

    const periodSales = salesData.filter(sale => {
        let saleDate;
        if (sale.createdAt && typeof sale.createdAt === 'string') {
            // Already converted to string
            saleDate = new Date(sale.createdAt);
        } else if (sale.createdAt && typeof sale.createdAt.toDate === 'function') {
            // Firestore timestamp object
            saleDate = sale.createdAt.toDate();
        } else if (sale.createdAt) {
            // Regular date string
            saleDate = new Date(sale.createdAt);
        } else {
            // Fallback to current date
            saleDate = new Date();
        }

        return saleDate >= startDate;
    });

    const revenue = periodSales.reduce((sum, sale) => sum + (sale.productPrice || sale.amount || sale.price || 0), 0);
    const orders = periodSales.length;
    const avgOrderValue = orders > 0 ? revenue / orders : 0;

    return {
        revenue,
        orders,
        avgOrderValue,
        startDate,
        endDate: now
    };
};

// Format analytics data for display
export const formatAnalyticsForDisplay = (analytics) => {
    return {
        ...analytics,
        totalRevenueFormatted: `$${analytics.totalRevenue.toFixed(2)}`,
        avgOrderValueFormatted: `$${analytics.avgOrderValue.toFixed(2)}`,
        conversionRateFormatted: `${analytics.conversionRate.toFixed(2)}%`
    };
};