import React, { useState, useEffect } from 'react';
import { TableItem } from '../../types';
import { api } from '../../services/api';
import {
  Plus,
  Download,
  Printer,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Eye,
  Users,
} from 'lucide-react';

export const AdminTables: React.FC = () => {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);

  // Form states
  const [tableNumber, setTableNumber] = useState('');
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [location, setLocation] = useState('Ground Floor Family Hall');

  const loadTables = async () => {
    try {
      const data = await api.getTables();
      setTables(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleOpenAdd = () => {
    setEditingTable(null);
    const nextNum = tables.length + 1;
    const pad = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
    setTableNumber(`T${pad}`);
    setName(`Krispier Table ${nextNum}`);
    setCapacity(4);
    setLocation('Ground Floor Family Hall');
    setShowAddModal(true);
  };

  const handleOpenEdit = (t: TableItem) => {
    setEditingTable(t);
    setTableNumber(t.tableNumber);
    setName(t.name);
    setCapacity(t.capacity);
    setLocation(t.location);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTable) {
        const updated = await api.updateTable(editingTable._id, { name, capacity, location });
        setTables((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      } else {
        const created = await api.createTable({
          tableNumber: tableNumber.toUpperCase(),
          name,
          capacity,
          location,
        });
        setTables((prev) => [...prev, created]);
      }
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Error saving table');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table?')) return;
    try {
      await api.deleteTable(id);
      setTables((prev) => prev.filter((t) => t._id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting table');
    }
  };

  const handleDownloadQr = (tbl: TableItem) => {
    if (!tbl.qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = tbl.qrCodeUrl;
    a.download = `Krispier-QR-Table-${tbl.tableNumber}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintQr = (tbl: TableItem) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>KRISPIER Table QR - ${tbl.tableNumber}</title>
          <style>
            body { font-family: system-ui, sans-serif; text-align: center; padding: 40px; margin: 0; background: #151515; color: #fff; }
            .card { border: 3px solid #FFC400; border-radius: 20px; padding: 36px; max-width: 360px; margin: 0 auto; background: #222222; }
            h1 { font-size: 28px; margin: 0 0 4px 0; color: #FFC400; font-weight: 900; letter-spacing: 2px; }
            .tagline { font-size: 13px; color: #D1D5DB; margin-bottom: 12px; }
            h2 { font-size: 36px; margin: 8px 0; color: #FFFFFF; font-weight: 900; }
            p { font-size: 13px; color: #A0A0A0; margin: 4px 0 16px 0; }
            img { width: 240px; height: 240px; margin: 0 auto; display: block; border-radius: 12px; background: #fff; padding: 10px; }
            .instructions { font-size: 12px; color: #D1D5DB; margin-top: 18px; line-height: 1.5; border-top: 1px dashed #353535; padding-top: 14px; }
            .instructions strong { color: #FFC400; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>KRISPIER</h1>
            <div class="tagline">Delight In Every Sauce · Kasur</div>
            <h2>TABLE ${tbl.tableNumber}</h2>
            <p>${tbl.name} · ${tbl.location}</p>
            <img src="${tbl.qrCodeUrl}" alt="Table ${tbl.tableNumber} QR" />
            <div class="instructions">
              <strong>Scan with Phone Camera to Order</strong><br/>
              Browse full Krispier fast-food menu and transmit order directly to fryer!
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="bg-[#222222] p-5 rounded-2xl border border-[#353535] shadow-lg flex justify-between items-center">
        <div>
          <h2 className="text-sm font-black text-white uppercase tracking-wider">Krispier Tables & QR Standees</h2>
          <p className="text-xs text-[#A0A0A0]">
            Generate contactless QR standees for Kasur dining booths and family halls
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Table</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tables.map((tbl) => (
          <div
            key={tbl._id}
            className="bg-[#222222] rounded-2xl border border-[#353535] hover:border-[#FFC400] shadow-lg overflow-hidden flex flex-col justify-between transition-all"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">
                      Table {tbl.tableNumber}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        tbl.status === 'occupied'
                          ? 'bg-[#151515] border border-[#EF4444] text-[#EF4444]'
                          : tbl.status === 'reserved'
                          ? 'bg-[#151515] border border-[#FFC400] text-[#FFC400]'
                          : 'bg-[#151515] border border-[#22C55E] text-[#22C55E]'
                      }`}
                    >
                      {tbl.status}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white mt-1">{tbl.name}</div>
                  <div className="text-[11px] text-[#A0A0A0] flex items-center gap-2 mt-1">
                    <span>{tbl.location}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[#FFC400]">
                      <Users className="w-3.5 h-3.5" />
                      {tbl.capacity} Seats
                    </span>
                  </div>
                </div>

                {/* QR thumbnail */}
                {tbl.qrCodeUrl && (
                  <button
                    type="button"
                    onClick={() => setSelectedTableForQr(tbl)}
                    className="cursor-pointer p-1.5 border border-[#353535] rounded-xl hover:border-[#FFC400] transition-colors shrink-0 bg-[#151515]"
                    title="View QR Code"
                  >
                    <img
                      src={tbl.qrCodeUrl}
                      alt={`Table ${tbl.tableNumber} QR`}
                      className="w-16 h-16 object-contain rounded-lg bg-white p-1"
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-[#181818] px-5 py-3 border-t border-[#353535] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTableForQr(tbl)}
                  className="cursor-pointer p-1.5 text-[#D1D5DB] hover:text-[#FFC400] hover:bg-[#282828] rounded-lg transition-colors"
                  title="View & Enlarge QR"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadQr(tbl)}
                  className="cursor-pointer p-1.5 text-[#D1D5DB] hover:text-[#22C55E] hover:bg-[#282828] rounded-lg transition-colors"
                  title="Download QR PNG"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintQr(tbl)}
                  className="cursor-pointer p-1.5 text-[#D1D5DB] hover:text-[#FFC400] hover:bg-[#282828] rounded-lg transition-colors"
                  title="Print Table QR Standee"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Direct link to simulate scanning table QR */}
                <a
                  href={`/menu?table=${tbl.tableNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-black uppercase text-[#FFC400] hover:text-[#FFB800]"
                  title="Open customer QR dining menu"
                >
                  <span>Test Menu</span>
                  <ExternalLink className="w-3 h-3 stroke-[2.5]" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(tbl)}
                  className="cursor-pointer p-1 text-[#A0A0A0] hover:text-[#FFC400]"
                  title="Edit Table Details"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(tbl._id)}
                  className="cursor-pointer p-1 text-[#A0A0A0] hover:text-[#EF4444]"
                  title="Delete Table"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* QR Code Inspection Modal */}
      {selectedTableForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#222222] rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#353535]">
            <div className="flex justify-between items-center pb-3 border-b border-[#353535]">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Table {selectedTableForQr.tableNumber} QR Code
              </h3>
              <button
                type="button"
                onClick={() => setSelectedTableForQr(null)}
                className="cursor-pointer text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white border border-[#353535] rounded-2xl inline-block mx-auto">
              <img
                src={selectedTableForQr.qrCodeUrl}
                alt={`Table ${selectedTableForQr.tableNumber} QR`}
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="text-xs text-[#D1D5DB]">
              Scan URL: <code className="text-[#FFC400] font-mono font-bold">/menu?table={selectedTableForQr.tableNumber}</code>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadQr(selectedTableForQr)}
                className="cursor-pointer flex-1 py-2.5 bg-[#151515] hover:bg-[#2d2d2d] text-white text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 border border-[#353535]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                type="button"
                onClick={() => handlePrintQr(selectedTableForQr)}
                className="cursor-pointer flex-1 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Standee</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#222222] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#353535] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#353535]">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {editingTable ? 'Edit Table' : 'Add Restaurant Table'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="cursor-pointer text-[#A0A0A0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {!editingTable && (
                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">
                    Table Identifier (e.g. T11) *
                  </label>
                  <input
                    type="text"
                    required
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="T11"
                    className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400] uppercase font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-[#D1D5DB] mb-1">Table Name / Display *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Family Booth 4"
                  className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white placeholder:text-[#666666] focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">Guest Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#D1D5DB] mb-1">Dining Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="cursor-pointer w-full px-3.5 py-2.5 bg-[#151515] border border-[#353535] rounded-xl text-white focus:outline-none focus:border-[#FFC400]"
                  >
                    <option value="Ground Floor Family Hall">Ground Floor Family Hall</option>
                    <option value="First Floor Dining">First Floor Dining</option>
                    <option value="Outdoor Terrace">Outdoor Terrace</option>
                    <option value="Party Room Suite">Party Room Suite</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cursor-pointer px-4 py-2.5 bg-[#151515] text-[#D1D5DB] font-bold rounded-xl border border-[#353535]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer px-6 py-2.5 bg-[#FFC400] hover:bg-[#FFB800] text-black font-black uppercase tracking-wider rounded-xl shadow-md"
                >
                  {editingTable ? 'Save Changes' : 'Generate Table & QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
