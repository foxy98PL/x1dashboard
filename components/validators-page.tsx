'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, ChevronLeft, ChevronRight, Copy, ExternalLink, Search, ArrowUpDown } from 'lucide-react';

interface ValidatorInfo {
  identity: string;
  voteAccount: string;
  commission: number;
  lastVote: number;
  credits: number;
  totalCredits: number;
  potentialAirdrop: number;
  activatedStake: number;
  delinquent?: boolean;
}

interface ValidatorsData {
  validators: ValidatorInfo[];
  stats: {
    total: number;
    average: number;
    min: number;
    max: number;
    totalCredits: number;
    totalPotentialAirdrop: number;
    totalGenesisAirdrop: number;
  };
  timestamp: string;
}

// API fetch function
async function fetchAllValidators(): Promise<ValidatorsData> {
  const response = await fetch('/api/validators');
  const data = await response.json();
  return data.data;
}

// Formatting functions
function formatXNT(num: number): string {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T XNT';
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B XNT';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M XNT';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K XNT';
  if (num >= 1) return num.toFixed(2) + ' XNT';
  if (num >= 0.01) return num.toFixed(4) + ' XNT';
  return num.toFixed(6) + ' XNT';
}

function formatNumber(num: number): string {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(0);
}

function formatCommission(num: number): string {
  return `${num.toFixed(2)}%`;
}

function formatAddress(address: string): string {
  return `${address.slice(0, 8)}...${address.slice(-8)}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function ValidatorsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'credits' | 'staked' | 'airdrop'>('credits');
  const [showDelinquent, setShowDelinquent] = useState(false);
  const validatorsPerPage = 25;

  const { data: validatorsData, isLoading } = useQuery<ValidatorsData>({
    queryKey: ['validators'],
    queryFn: fetchAllValidators,
    staleTime: Infinity,       // dane nigdy nie są przestarzałe  // przechowuj dane w cache na zawsze
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-slate-600 dark:text-slate-400">Loading Validators...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!validatorsData) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-slate-600 dark:text-slate-400">No validator data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter and sort validators
  const filteredValidators = validatorsData.validators.filter(validator => {
    const matchesSearch = validator.identity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          validator.voteAccount.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDelinquentFilter = showDelinquent ? validator.delinquent === true : validator.delinquent !== true;
    return matchesSearch && matchesDelinquentFilter;
  });

  const sortedValidators = filteredValidators.sort((a, b) => {
    switch (sortBy) {
      case 'credits':
        return b.totalCredits - a.totalCredits;
      case 'staked':
        return b.activatedStake - a.activatedStake;
      case 'airdrop':
        return b.potentialAirdrop - a.potentialAirdrop;
      default:
        return b.totalCredits - a.totalCredits;
    }
  });

  const totalPages = Math.ceil(sortedValidators.length / validatorsPerPage);
  const startIndex = (currentPage - 1) * validatorsPerPage;
  const endIndex = startIndex + validatorsPerPage;
  const currentValidators = sortedValidators.slice(startIndex, endIndex);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-slate-800 dark:text-slate-100 tracking-tight">Validators Network</h1>
          <p className="text-center text-slate-600 dark:text-slate-400 text-base">Detailed validator information and performance metrics</p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                <Users className="h-5 w-5 text-blue-600" /> Network Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-1">{validatorsData.stats.total}</div>
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Validators</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">{formatCommission(validatorsData.stats.average)}</div>
                  <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Avg Commission</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-700">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">{formatNumber(validatorsData.stats.totalCredits)}</div>
                  <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Credits</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/30 dark:to-rose-800/30 rounded-lg border border-rose-200 dark:border-rose-700">
                  <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 mb-1">{formatXNT(validatorsData.stats.totalPotentialAirdrop)}</div>
                  <div className="text-sm font-medium text-rose-600 dark:text-rose-400">Total Airdrop</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search, Sort, Toggle */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="mb-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by validator address..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => { setSortBy(e.target.value as 'credits' | 'staked' | 'airdrop'); setCurrentPage(1); }}
                    className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="credits">Sort by Credits</option>
                    <option value="staked">Sort by Staked Amount</option>
                    <option value="airdrop">Sort by Airdrop</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium transition-colors ${!showDelinquent ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Active Only</span>
                    <button
                      type="button"
                      onClick={() => { setShowDelinquent(!showDelinquent); setCurrentPage(1); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${showDelinquent ? 'bg-red-600 dark:bg-red-500' : 'bg-blue-600 dark:bg-blue-500'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showDelinquent ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-sm font-medium transition-colors ${showDelinquent ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}`}>Delinquent Only</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredValidators.length} of {validatorsData.validators.length} validators
                {searchTerm && <span className="ml-2 text-blue-600 dark:text-blue-400">(filtered by "{searchTerm}")</span>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Validators Table */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="border-slate-200 dark:border-slate-700 shadow-lg bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100">Validators List</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Showing {startIndex + 1}-{Math.min(endIndex, sortedValidators.length)} of {sortedValidators.length} validators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Validator</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Staked</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Commission</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Credits</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Full Airdrop</th>
                      <th className="text-left py-3 px-2 font-semibold text-slate-700 dark:text-slate-300">Genesis (10%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentValidators.map((validator, index) => (
                      <motion.tr
                        key={validator.identity}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {index + startIndex + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">
                                {formatAddress(validator.identity)}
                                {validator.delinquent && (
                                  <Badge variant="outline" className="ml-2 text-xs border-red-200 text-red-700 dark:border-red-700 dark:text-red-400">Delinquent</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <button onClick={() => copyToClipboard(validator.identity)} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                                  <Copy className="h-3 w-3" />
                                </button>
                                <a href={`https://explorer.x1.xyz/address/${validator.identity}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-700">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-slate-800 dark:text-slate-200">{formatXNT(validator.activatedStake)}</td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className={`text-xs ${
                            validator.commission < 5 ? 'border-emerald-200 text-emerald-700 dark:border-emerald-700 dark:text-emerald-400' :
                            validator.commission < 10 ? 'border-amber-200 text-amber-700 dark:border-amber-700 dark:text-amber-400' :
                            'border-red-200 text-red-700 dark:border-red-700 dark:text-red-400'
                          }`}>
                            {formatCommission(validator.commission)}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm font-medium text-slate-800 dark:text-slate-200">{formatNumber(validator.totalCredits)}</td>
                        <td className="py-3 px-2 text-sm font-medium text-slate-800 dark:text-slate-200">{formatXNT(validator.potentialAirdrop)}</td>
                        <td className="py-3 px-2 text-sm font-medium text-slate-800 dark:text-slate-200">{formatXNT(validator.potentialAirdrop * 0.1)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {sortedValidators.length > 0 && (
                <div className="flex items-center justify-between mt-6 px-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages} className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {sortedValidators.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-slate-500 dark:text-slate-400 text-lg mb-2">No validators found</div>
                  <div className="text-slate-400 dark:text-slate-500 text-sm">
                    {searchTerm ? `Try adjusting your search term "${searchTerm}"` : 'No validators match your criteria'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
