import { X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

interface QRDisplayProps {
  invoice: string;
  amount: number;
  message: string;
  onClose: () => void;
}

export function QRDisplay({ invoice, amount, message, onClose }: QRDisplayProps) {
  const qrRef = React.useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'lightning-invoice.png';
      link.click();
    }
  };
  return (
    <div className="w-full bg-white border-2 border-orange-500 rounded-lg p-6 shadow-xl animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Lightning Invoice</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg flex items-center justify-center">
          <div ref={qrRef} className="bg-white p-4 rounded-lg">
            <QRCodeCanvas
              value={invoice}
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
        </div>
        <button
          onClick={downloadQR}
          className="w-full mt-3 bg-orange-100 hover:bg-orange-200 text-orange-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Download QR Code
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Amount:</span>
          <span className="font-semibold text-gray-800">{amount.toLocaleString()} sats</span>
        </div>
        {message && (
          <div className="flex justify-between">
            <span className="text-gray-600">Message:</span>
            <span className="font-medium text-gray-800 text-right max-w-[200px] truncate">
              {message}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600 break-all font-mono">
          {invoice}
        </p>
      </div>
    </div>
  );
}
