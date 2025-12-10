import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RotateCcw, Calculator, DollarSign, Check, Package, Trash2 } from "lucide-react";
import { SaveInvoiceDialog } from "@/components/SaveInvoiceDialog";
import { AddProductDialog } from "@/components/AddProductDialog";
import { EditProductDialog } from "@/components/EditProductDialog";
import { EditRestPercentageDialog } from "@/components/EditRestPercentageDialog";
import { BreakdownTable } from "@/components/BreakdownTable";
import { formatNumber, formatCurrency } from "@/lib/formatters";

interface Product {
  id: string;
  name: string;
  percentage: number;
  color: string;
  is_default: boolean;
}

interface Breakdown {
  name: string;
  label: string;
  amount: number;
  percentage: number;
  commission: number;
  color: string;
}

interface Calculations {
  breakdown: Breakdown[];
  restAmount: number;
  restCommission: number;
  totalCommission: number;
}

interface CalculatorViewProps {
  products: Product[];
  productAmounts: Record<string, number>;
  totalInvoice: number;
  setTotalInvoice: (value: number) => void;
  calculations: Calculations;
  restPercentage: number;
  isLoading: boolean;
  onProductChange: (id: string, value: number) => void;
  onReset: () => void;
  onAddProduct: (name: string, percentage: number) => Promise<any>;
  onUpdateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  onDeleteProduct: (id: string) => void;
  onUpdateRestPercentage: (value: number) => Promise<boolean>;
  onSaveInvoice: (ncf: string, invoiceDate: string) => Promise<any>;
  suggestedNcf?: number | null;
}

export const CalculatorView = ({
  products,
  productAmounts,
  totalInvoice,
  setTotalInvoice,
  calculations,
  restPercentage,
  isLoading,
  onProductChange,
  onReset,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateRestPercentage,
  onSaveInvoice,
  suggestedNcf,
}: CalculatorViewProps) => {
  const [displayValue, setDisplayValue] = useState(totalInvoice > 0 ? formatNumber(totalInvoice) : '');
  const [productDisplayValues, setProductDisplayValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '');
    if (raw && !/^\d+$/.test(raw)) return;
    
    const numValue = parseInt(raw, 10) || 0;
    setTotalInvoice(numValue);
    
    if (numValue > 0) {
      setDisplayValue(formatNumber(numValue));
    } else {
      setDisplayValue('');
    }
  };

  const handleProductAmountChange = (id: string, value: string) => {
    const raw = value.replace(/,/g, '');
    if (raw && !/^\d+$/.test(raw)) return;
    
    const numValue = parseInt(raw, 10) || 0;
    onProductChange(id, numValue);
    
    if (numValue > 0) {
      setProductDisplayValues(prev => ({ ...prev, [id]: formatNumber(numValue) }));
    } else {
      setProductDisplayValues(prev => ({ ...prev, [id]: '' }));
    }
  };

  const handleReset = () => {
    setDisplayValue('');
    setProductDisplayValues({});
    setSearchTerm('');
    onReset();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasResult = totalInvoice > 0;

  return (
    <div className="animate-fade-in">
      <div className={`grid gap-6 ${hasResult ? 'lg:grid-cols-2' : 'max-w-xl mx-auto'}`}>
        {/* Left Column - Calculator */}
        <Card className="overflow-hidden card-shadow hover-lift">
          {/* Header */}
          <div className="gradient-primary px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Calculator className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-primary-foreground">Calculadora de Comisiones</h1>
                <p className="text-primary-foreground/70 text-sm">Calcula tu ganancia rápidamente</p>
              </div>
            </div>
          </div>

          {/* Invoice Total Input */}
          <div className="p-5 border-b border-border">
            <label className="block text-sm font-medium text-foreground mb-2">
              Total de la factura
            </label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground group-focus-within:text-primary transition-colors">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleTotalChange}
                className="w-full h-14 pl-9 pr-4 text-2xl font-bold text-foreground rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all hover:border-primary/50"
                placeholder="0"
              />
            </div>
            {hasResult && (
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5 animate-fade-in">
                <Check className="h-3.5 w-3.5 text-success" />
                Factura registrada
              </p>
            )}
          </div>

          {/* Products Section */}
          {hasResult && (
            <div className="border-b border-border">
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Productos con Comisión Variable</h3>
                  </div>
                  <AddProductDialog onAdd={onAddProduct} />
                </div>
                
                {/* Search Input - Enhanced autocomplete */}
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Buscar o seleccionar producto..."
                    className="w-full h-10 px-4 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                  
                  {/* Suggestions Dropdown - Shows on focus even without typing */}
                  {showSuggestions && (searchTerm ? filteredProducts : products).length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      {(searchTerm ? filteredProducts : products.slice(0, 8)).map((product) => {
                        const hasAmount = (productAmounts[product.id] || 0) > 0;
                        return (
                          <button
                            key={product.id}
                            onClick={() => {
                              setSearchTerm('');
                              setShowSuggestions(false);
                              // Scroll to product and focus input
                              setTimeout(() => {
                                const input = document.getElementById(`product-input-${product.id}`);
                                const container = input?.closest('.space-y-2');
                                if (input && container) {
                                  input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  input.focus();
                                }
                              }, 50);
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
                              hasAmount ? 'bg-success/5' : ''
                            }`}
                          >
                            <span 
                              className="h-7 w-7 rounded flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0"
                              style={{ backgroundColor: product.color }}
                            >
                              {product.percentage}%
                            </span>
                            <span className="text-sm font-medium text-foreground flex-1">{product.name}</span>
                            {hasAmount && (
                              <span className="text-xs text-success font-medium">
                                ${formatNumber(productAmounts[product.id])}
                              </span>
                            )}
                          </button>
                        );
                      })}
                      {!searchTerm && products.length > 8 && (
                        <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t border-border">
                          Escribe para buscar entre {products.length} productos
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                      {(searchTerm ? filteredProducts : products).map((product, index) => {
                      const amount = productAmounts[product.id] || 0;
                      const commission = amount * (product.percentage / 100);
                      
                      return (
                        <div 
                          key={product.id}
                          className="group flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-all duration-200 hover-lift"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <div 
                            className="h-8 w-8 rounded flex items-center justify-center text-xs font-bold text-primary-foreground shrink-0"
                            style={{ backgroundColor: product.color }}
                          >
                            {product.percentage}%
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-foreground truncate">{product.name}</span>
                              <EditProductDialog 
                                product={product}
                                onUpdate={onUpdateProduct}
                              />
                              {!product.is_default && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => onDeleteProduct(product.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              )}
                            </div>
                            {amount > 0 && (
                              <span className="text-xs font-medium" style={{ color: product.color }}>
                                +${formatCurrency(commission)}
                              </span>
                            )}
                          </div>
                          
                          <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                            <input
                              id={`product-input-${product.id}`}
                              type="text"
                              inputMode="numeric"
                              value={productDisplayValues[product.id] || (amount > 0 ? formatNumber(amount) : '')}
                              onChange={(e) => handleProductAmountChange(product.id, e.target.value)}
                              className="w-full h-8 pl-5 pr-2 text-sm text-right font-medium rounded border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary transition-all"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Rest info */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 text-sm mt-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {restPercentage}%
                    </span>
                    <span className="text-muted-foreground">Resto</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">${formatNumber(calculations.restAmount)}</span>
                    <EditRestPercentageDialog 
                      currentValue={restPercentage} 
                      onUpdate={onUpdateRestPercentage} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Result Section - Mobile */}
          {hasResult && (
            <div className="p-5 gradient-success lg:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-success-foreground/80 mb-0.5">Tu comisión total</p>
                  <p className="text-3xl font-bold text-success-foreground animate-number">
                    ${formatCurrency(calculations.totalCommission)}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-success-foreground/20 flex items-center justify-center animate-pulse-soft">
                  <DollarSign className="h-6 w-6 text-success-foreground" />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Right Column - Breakdown Table */}
        {hasResult && (
          <div className="space-y-4">
            <BreakdownTable
              totalInvoice={totalInvoice}
              breakdown={calculations.breakdown}
              restAmount={calculations.restAmount}
              restPercentage={restPercentage}
              restCommission={calculations.restCommission}
              totalCommission={calculations.totalCommission}
            />
            
            {/* Actions */}
            <div className="flex gap-3 animate-slide-up">
              <SaveInvoiceDialog
                totalInvoice={totalInvoice}
                totalCommission={calculations.totalCommission}
                onSave={onSaveInvoice}
                disabled={totalInvoice === 0}
                suggestedNcf={suggestedNcf}
              />
              <Button
                variant="outline"
                onClick={handleReset}
                className="gap-2 h-11 flex-1"
              >
                <RotateCcw className="h-4 w-4" />
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Welcome State - When no result yet */}
      {!hasResult && (
        <div className="max-w-xl mx-auto mt-6 space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground text-sm mb-4">
              Ingresa el total de la factura para calcular tu comisión
            </p>
          </div>
          
          {/* Quick Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-muted/50 border border-border hover-lift">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1">Cálculo automático</h4>
              <p className="text-xs text-muted-foreground">Las comisiones se calculan al instante según tus productos</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border hover-lift">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center mb-2">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1">Guarda tu historial</h4>
              <p className="text-xs text-muted-foreground">Mantén un registro de todas tus facturas y comisiones</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/50 border border-border hover-lift">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                <Package className="h-4 w-4 text-accent" />
              </div>
              <h4 className="text-sm font-medium text-foreground mb-1">Productos personalizados</h4>
              <p className="text-xs text-muted-foreground">Agrega productos con diferentes porcentajes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
