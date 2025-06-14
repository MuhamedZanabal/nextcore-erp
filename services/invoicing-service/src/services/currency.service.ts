import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
  isActive: boolean;
}

export interface ExchangeRate {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: Date;
  source: string;
}

export interface CurrencyConversion {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  convertedAmount: number;
  exchangeRate: number;
  conversionDate: Date;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  
  // Cache for exchange rates (in production, use Redis)
  private exchangeRateCache = new Map<string, ExchangeRate>();
  private cacheExpiry = new Map<string, Date>();

  // Supported currencies
  private supportedCurrencies: Currency[] = [
    { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2, isActive: true },
    { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2, isActive: true },
    { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2, isActive: true },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0, isActive: true },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2, isActive: true },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2, isActive: true },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2, isActive: true },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2, isActive: true },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2, isActive: true },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2, isActive: true },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalPlaces: 2, isActive: true },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2, isActive: true },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2, isActive: true },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalPlaces: 2, isActive: true },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalPlaces: 2, isActive: true },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimalPlaces: 2, isActive: true },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimalPlaces: 2, isActive: true },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', decimalPlaces: 2, isActive: true },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', decimalPlaces: 0, isActive: true },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimalPlaces: 2, isActive: true },
  ];

  constructor(private configService: ConfigService) {}

  getSupportedCurrencies(): Currency[] {
    return this.supportedCurrencies.filter(c => c.isActive);
  }

  getCurrency(code: string): Currency | null {
    return this.supportedCurrencies.find(c => c.code === code) || null;
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = this.exchangeRateCache.get(cacheKey);
    const expiry = this.cacheExpiry.get(cacheKey);

    // Check if cached rate is still valid (1 hour expiry)
    if (cached && expiry && expiry > new Date()) {
      this.logger.debug(`Using cached exchange rate for ${cacheKey}: ${cached.rate}`);
      return cached.rate;
    }

    try {
      // Fetch fresh exchange rate
      const rate = await this.fetchExchangeRate(fromCurrency, toCurrency);
      
      // Cache the rate
      this.exchangeRateCache.set(cacheKey, {
        fromCurrency,
        toCurrency,
        rate,
        date: new Date(),
        source: 'external_api',
      });
      
      this.cacheExpiry.set(cacheKey, new Date(Date.now() + 60 * 60 * 1000)); // 1 hour
      
      this.logger.log(`Fetched exchange rate for ${cacheKey}: ${rate}`);
      return rate;
    } catch (error) {
      this.logger.error(`Error fetching exchange rate for ${cacheKey}:`, error);
      
      // Fallback to cached rate if available, even if expired
      if (cached) {
        this.logger.warn(`Using expired cached rate for ${cacheKey}: ${cached.rate}`);
        return cached.rate;
      }
      
      throw new Error(`Unable to get exchange rate for ${fromCurrency} to ${toCurrency}`);
    }
  }

  private async fetchExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    // In production, integrate with exchange rate APIs like:
    // - ExchangeRate-API
    // - Fixer.io
    // - CurrencyLayer
    // - Open Exchange Rates
    
    const apiKey = this.configService.get<string>('EXCHANGE_RATE_API_KEY');
    
    if (apiKey) {
      try {
        // Example with ExchangeRate-API
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${fromCurrency}/${toCurrency}`
        );
        
        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.result === 'success') {
          return data.conversion_rate;
        } else {
          throw new Error(`API error: ${data['error-type']}`);
        }
      } catch (error) {
        this.logger.error('Error fetching from exchange rate API:', error);
        // Fall through to mock data
      }
    }

    // Mock exchange rates for development/testing
    return this.getMockExchangeRate(fromCurrency, toCurrency);
  }

  private getMockExchangeRate(fromCurrency: string, toCurrency: string): number {
    // Mock exchange rates (approximate values for testing)
    const mockRates: Record<string, Record<string, number>> = {
      USD: {
        EUR: 0.85, GBP: 0.73, JPY: 110, CAD: 1.25, AUD: 1.35,
        CHF: 0.92, CNY: 6.45, INR: 74.5, BRL: 5.2, MXN: 20.1,
        SGD: 1.35, HKD: 7.8, NOK: 8.6, SEK: 8.9, DKK: 6.3,
        PLN: 3.9, CZK: 21.5, HUF: 295, RUB: 73.5
      },
      EUR: {
        USD: 1.18, GBP: 0.86, JPY: 129, CAD: 1.47, AUD: 1.59,
        CHF: 1.08, CNY: 7.6, INR: 87.8, BRL: 6.1, MXN: 23.7,
        SGD: 1.59, HKD: 9.2, NOK: 10.1, SEK: 10.5, DKK: 7.4,
        PLN: 4.6, CZK: 25.3, HUF: 347, RUB: 86.5
      },
      GBP: {
        USD: 1.37, EUR: 1.16, JPY: 150, CAD: 1.71, AUD: 1.85,
        CHF: 1.26, CNY: 8.8, INR: 102, BRL: 7.1, MXN: 27.5,
        SGD: 1.85, HKD: 10.7, NOK: 11.8, SEK: 12.2, DKK: 8.6,
        PLN: 5.3, CZK: 29.4, HUF: 404, RUB: 100.7
      }
    };

    const fromRates = mockRates[fromCurrency];
    if (fromRates && fromRates[toCurrency]) {
      return fromRates[toCurrency];
    }

    // Try reverse rate
    const toRates = mockRates[toCurrency];
    if (toRates && toRates[fromCurrency]) {
      return 1 / toRates[fromCurrency];
    }

    // Default fallback
    this.logger.warn(`No mock rate available for ${fromCurrency} to ${toCurrency}, using 1.0`);
    return 1.0;
  }

  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion> {
    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedAmount = amount * exchangeRate;
    
    // Round to appropriate decimal places
    const toCurrencyInfo = this.getCurrency(toCurrency);
    const decimalPlaces = toCurrencyInfo?.decimalPlaces || 2;
    const roundedAmount = Math.round(convertedAmount * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);

    return {
      amount,
      fromCurrency,
      toCurrency,
      convertedAmount: roundedAmount,
      exchangeRate,
      conversionDate: new Date(),
    };
  }

  async convertMultipleCurrencies(
    amount: number,
    fromCurrency: string,
    toCurrencies: string[]
  ): Promise<CurrencyConversion[]> {
    const conversions = await Promise.all(
      toCurrencies.map(toCurrency => 
        this.convertCurrency(amount, fromCurrency, toCurrency)
      )
    );

    return conversions;
  }

  formatCurrency(amount: number, currencyCode: string): string {
    const currency = this.getCurrency(currencyCode);
    if (!currency) {
      return `${amount.toFixed(2)} ${currencyCode}`;
    }

    const formattedAmount = amount.toFixed(currency.decimalPlaces);
    
    // Simple formatting - in production, use Intl.NumberFormat for locale-specific formatting
    switch (currencyCode) {
      case 'USD':
      case 'CAD':
      case 'AUD':
      case 'MXN':
        return `${currency.symbol}${formattedAmount}`;
      case 'EUR':
      case 'GBP':
      case 'CHF':
        return `${currency.symbol}${formattedAmount}`;
      case 'JPY':
      case 'CNY':
        return `${currency.symbol}${formattedAmount}`;
      case 'INR':
        return `${currency.symbol}${formattedAmount}`;
      case 'BRL':
        return `${currency.symbol} ${formattedAmount}`;
      case 'SGD':
      case 'HKD':
        return `${currency.symbol}${formattedAmount}`;
      case 'NOK':
      case 'SEK':
      case 'DKK':
        return `${formattedAmount} ${currency.symbol}`;
      case 'PLN':
        return `${formattedAmount} ${currency.symbol}`;
      case 'CZK':
        return `${formattedAmount} ${currency.symbol}`;
      case 'HUF':
        return `${formattedAmount} ${currency.symbol}`;
      case 'RUB':
        return `${formattedAmount} ${currency.symbol}`;
      default:
        return `${currency.symbol}${formattedAmount}`;
    }
  }

  async getHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    startDate: Date,
    endDate: Date
  ): Promise<ExchangeRate[]> {
    // In production, this would fetch historical data from an API
    // For now, return mock data
    const rates: ExchangeRate[] = [];
    const currentRate = await this.getExchangeRate(fromCurrency, toCurrency);
    
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const rate = currentRate * (1 + variation);
      
      rates.push({
        fromCurrency,
        toCurrency,
        rate: Math.round(rate * 10000) / 10000, // 4 decimal places
        date,
        source: 'historical_api',
      });
    }

    return rates;
  }

  async getCurrencyTrends(
    baseCurrency: string,
    targetCurrencies: string[],
    days: number = 30
  ): Promise<Record<string, ExchangeRate[]>> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const trends: Record<string, ExchangeRate[]> = {};
    
    for (const targetCurrency of targetCurrencies) {
      trends[targetCurrency] = await this.getHistoricalRates(
        baseCurrency,
        targetCurrency,
        startDate,
        endDate
      );
    }

    return trends;
  }

  clearCache(): void {
    this.exchangeRateCache.clear();
    this.cacheExpiry.clear();
    this.logger.log('Exchange rate cache cleared');
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.exchangeRateCache.size,
      entries: Array.from(this.exchangeRateCache.keys()),
    };
  }
}