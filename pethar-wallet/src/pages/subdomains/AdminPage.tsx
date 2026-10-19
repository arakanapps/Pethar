import { useState, useEffect, useMemo } from 'react';
import { BaseLayout } from './BaseLayout';
import type { Language } from '../../i18n';
import {
  ShieldAlert, Users, Activity, Sliders, Lock, Unlock,
  UserCheck, Eye, CheckCircle2, XCircle, AlertTriangle,
  Search, Download, RefreshCw, FileText, Server,
  ArrowUpRight, Check, X, Radio, Sparkles, SlidersHorizontal,
  BadgeCheck
} from 'lucide-react';
import type { Txn } from '../../data';
import {
  fetchTransactionsFromDb,
  fetchAllUsersForAdmin,
  updateUserStatusInDb,
  updateCitizenKycInDb,
} from '../../services/walletDatabase';

interface AdminPageProps {
  lang: Language;
}

interface KycApplicant {
  id: string;
  name: string;
  nameMm: string;
  fatherName: string;
  township: string;
  townshipMm: string;
  idCard: string;
  dob: string;
  gender: 'Male' | 'Female';
  occupation: string;
  phone: string;
  email: string;
  uid: string;
  walletAddress: string;
  submitted: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  riskScore: 'Low' | 'Medium' | 'High';
  faceMatchScore: number;
  docQuality: string;
  rejectionReason?: string;
  complianceNotes?: string;
}

interface AdminUserRecord {
  uid: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  walletAddress: string;
  akdBalance: number;
  usdBalance: number;
  kycTier: 1 | 2;
  status: 'ACTIVE' | 'SUSPENDED' | 'FROZEN';
  dailyLimit: number;
  dailyUsed: number;
  registeredDate: string;
  lastActive: string;
  township: string;
  complianceNotes: string;
}

interface SystemAuditLog {
  id: string;
  timestamp: string;
  operator: string;
  category: 'KYC' | 'USER_CONTROL' | 'POLICY' | 'LEDGER' | 'SECURITY';
  action: string;
  details: string;
  targetId: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

interface ValidatorNode {
  id: string;
  name: string;
  region: string;
  ip: string;
  ping: number;
  uptime: string;
  state: 'Active Master' | 'Active Validator' | 'Syncing';
  blockHeight: number;
  peers: number;
  cpu: number;
  mem: number;
}

export const AdminPage = ({ lang }: AdminPageProps) => {
  const isAk = lang === 'ak';

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'monitoring' | 'kyc' | 'users' | 'audit' | 'policy' | 'nodes'>('monitoring');

  // Transactions list
  const [txList, setTxList] = useState<Txn[]>([]);
  const [loadingTxs, setLoadingTxs] = useState(false);

  // KYC State
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('pending');
  const [kycSearch, setKycSearch] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<KycApplicant | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState('Blurry photo / Unreadable NRC ID document');
  const [customRejectNote, setCustomRejectNote] = useState('');

  // User Management State
  const [userFilter, setUserFilter] = useState<'all' | 'ACTIVE' | 'SUSPENDED' | 'FROZEN'>('all');
  const [userTierFilter, setUserTierFilter] = useState<'all' | 'tier1' | 'tier2'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [userControlModalOpen, setUserControlModalOpen] = useState(false);
  const [newDailyLimit, setNewDailyLimit] = useState(50000);
  const [userActionReason, setUserActionReason] = useState('');

  // Emergency Circuit Breaker
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false);
  const [circuitBreakerPin, setCircuitBreakerPin] = useState('');
  const [circuitBreakerActive, setCircuitBreakerActive] = useState(false);

  // General Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Audit Search
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');

  // Initial KYC Queue Seed with Rich Arakan Citizen Dossiers
  const [kycQueue, setKycQueue] = useState<KycApplicant[]>([
    {
      id: 'KYC-801',
      name: 'Ko Hlaing Min',
      nameMm: 'ကိုလှိုင်မင်း',
      fatherName: 'U Aung Kyaw',
      township: 'Sittwe · Strand Rd',
      townshipMm: 'စစ်တွေ · ကမ်းနားလမ်း',
      idCard: 'ARAK-NAT-99102',
      dob: '1992-04-12',
      gender: 'Male',
      occupation: 'Maritime Transport & Cargo',
      phone: '+95 9 881 293 881',
      email: 'hlaingmin@pethar.co.uk',
      uid: '202610190001',
      walletAddress: '0x7b231948ba28c9a173918a27b91c28f01',
      submitted: '12 mins ago',
      status: 'Pending',
      riskScore: 'Low',
      faceMatchScore: 99.4,
      docQuality: 'High Resolution · Hologram Verified',
      complianceNotes: 'Sanctions check negative. Verified against civil registry.',
    },
    {
      id: 'KYC-802',
      name: 'Ma Khin Thet',
      nameMm: 'မခင်သက်',
      fatherName: 'U Thaung Nyunt',
      township: 'Mrauk-U · Palace Rd',
      townshipMm: 'မြောက်ဦး · နန်းရာလမ်း',
      idCard: 'ARAK-NAT-44120',
      dob: '1995-09-24',
      gender: 'Female',
      occupation: 'Heritage Handicrafts Enterprise',
      phone: '+95 9 772 104 992',
      email: 'khinthet@gmail.com',
      uid: '202610190002',
      walletAddress: '0x39a1c8b91048bc72619472ba1894cf82',
      submitted: '34 mins ago',
      status: 'Pending',
      riskScore: 'Low',
      faceMatchScore: 98.7,
      docQuality: 'Clean Scan · Liveness Passed',
      complianceNotes: 'Merchant tier application requested simultaneously.',
    },
    {
      id: 'KYC-803',
      name: 'U San Kyaw',
      nameMm: 'ဦးစံကျော်',
      fatherName: 'U Ba Thein',
      township: 'Kyaukphyu · Port Area',
      townshipMm: 'ကျောက်ဖြူ · ဆိပ်ကမ်းရပ်',
      idCard: 'ARAK-NAT-33019',
      dob: '1981-11-03',
      gender: 'Male',
      occupation: 'Fisheries Cold Storage Logistics',
      phone: '+95 9 443 891 002',
      email: 'sankyaw.kp@outlook.com',
      uid: '202610190003',
      walletAddress: '0x88219401bfca92847103829104fa2891',
      submitted: '1 hour ago',
      status: 'Pending',
      riskScore: 'Medium',
      faceMatchScore: 94.1,
      docQuality: 'Moderate Lighting · ID Corners Visible',
      complianceNotes: 'Cross-checked with port authority vendor list.',
    },
    {
      id: 'KYC-804',
      name: 'Daw Mya Nwe',
      nameMm: 'ဒေါ်မြနွယ်',
      fatherName: 'U Shwe Tun',
      township: 'Thandwe · Main Market',
      townshipMm: 'သံတွဲ · စျေးမကြီး',
      idCard: 'ARAK-NAT-12904',
      dob: '1988-02-18',
      gender: 'Female',
      occupation: 'Wholesale Dry Goods & Grocery',
      phone: '+95 9 250 188 941',
      email: 'myanwe.thandwe@gmail.com',
      uid: '202610190004',
      walletAddress: '0x1402849182abdc91827401928374bc10',
      submitted: '2 hours ago',
      status: 'Pending',
      riskScore: 'Low',
      faceMatchScore: 99.1,
      docQuality: 'Crystal Clear · NFC Authenticated',
      complianceNotes: 'Clean AML record.',
    },
    {
      id: 'KYC-805',
      name: 'Ko Zaw Min Tun',
      nameMm: 'ကိုဇော်မင်းထွန်း',
      fatherName: 'U Tun Yin',
      township: 'Maungdaw · Border Trade Zone',
      townshipMm: 'မောင်တော · နယ်စပ်ကုန်သွယ်ရေး',
      idCard: 'ARAK-NAT-88129',
      dob: '1990-07-30',
      gender: 'Male',
      occupation: 'Cross-Border Logistics Agency',
      phone: '+95 9 691 004 881',
      email: 'zawmintun.md@pethar.co.uk',
      uid: '202610190005',
      walletAddress: '0x6291a8291048ba9284104928bfa10482',
      submitted: '3 hours ago',
      status: 'Flagged',
      riskScore: 'High',
      faceMatchScore: 82.4,
      docQuality: 'Low Contrast · Potential Glare on Seal',
      complianceNotes: 'High volume transfer corridor flag. Requires dual-operator signoff.',
    },
    {
      id: 'KYC-800',
      name: 'Daw Nu Nu Wai',
      nameMm: 'ဒေါ်နုနုဝေ',
      fatherName: 'U Ba Win',
      township: 'Minbya · East Quarter',
      townshipMm: 'မင်းပြား · အရှေ့ရပ်',
      idCard: 'ARAK-NAT-55109',
      dob: '1993-12-05',
      gender: 'Female',
      occupation: 'Pharmacy & Medical Supplies',
      phone: '+95 9 421 990 128',
      email: 'nunuwai@gmail.com',
      uid: '202610190006',
      walletAddress: '0x992019482ba189472019482918abcf81',
      submitted: 'Yesterday',
      status: 'Approved',
      riskScore: 'Low',
      faceMatchScore: 99.8,
      docQuality: 'Verified · Enrolled in Tier-2',
      complianceNotes: 'Approved by ROOT-OPERATOR-01.',
    },
  ]);

  // Initial Citizen Users Directory
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([
    {
      uid: '202610190001',
      name: 'Ko Hlaing Min',
      username: '@hlaingmin',
      phone: '+95 9 881 293 881',
      email: 'hlaingmin@pethar.co.uk',
      walletAddress: '0x7b231948ba28c9a173918a27b91c28f01',
      akdBalance: 14850.50,
      usdBalance: 2400.00,
      kycTier: 1,
      status: 'ACTIVE',
      dailyLimit: 50000,
      dailyUsed: 12400,
      registeredDate: '2026-10-10',
      lastActive: '5 mins ago',
      township: 'Sittwe',
      complianceNotes: 'Standard verified account. No compliance alerts.',
    },
    {
      uid: '202610190002',
      name: 'Ma Khin Thet',
      username: '@khinthet',
      phone: '+95 9 772 104 992',
      email: 'khinthet@gmail.com',
      walletAddress: '0x39a1c8b91048bc72619472ba1894cf82',
      akdBalance: 82500.00,
      usdBalance: 8500.00,
      kycTier: 2,
      status: 'ACTIVE',
      dailyLimit: 250000,
      dailyUsed: 42000,
      registeredDate: '2026-09-15',
      lastActive: 'Just now',
      township: 'Mrauk-U',
      complianceNotes: 'Tier-2 verified artisan merchant. Consistent volume.',
    },
    {
      uid: '202610190003',
      name: 'U San Kyaw',
      username: '@sankyaw_port',
      phone: '+95 9 443 891 002',
      email: 'sankyaw.kp@outlook.com',
      walletAddress: '0x88219401bfca92847103829104fa2891',
      akdBalance: 125000.75,
      usdBalance: 14200.00,
      kycTier: 2,
      status: 'ACTIVE',
      dailyLimit: 300000,
      dailyUsed: 185000,
      registeredDate: '2026-08-20',
      lastActive: '12 mins ago',
      township: 'Kyaukphyu',
      complianceNotes: 'Port terminal operator float management.',
    },
    {
      uid: '202610190004',
      name: 'Daw Mya Nwe',
      username: '@myanwe_store',
      phone: '+95 9 250 188 941',
      email: 'myanwe.thandwe@gmail.com',
      walletAddress: '0x1402849182abdc91827401928374bc10',
      akdBalance: 4200.00,
      usdBalance: 450.00,
      kycTier: 1,
      status: 'ACTIVE',
      dailyLimit: 50000,
      dailyUsed: 1800,
      registeredDate: '2026-10-18',
      lastActive: '22 mins ago',
      township: 'Thandwe',
      complianceNotes: 'Pending Tier-2 verification review.',
    },
    {
      uid: '202610190005',
      name: 'Ko Zaw Min Tun',
      username: '@zawmin_border',
      phone: '+95 9 691 004 881',
      email: 'zawmintun.md@pethar.co.uk',
      walletAddress: '0x6291a8291048ba9284104928bfa10482',
      akdBalance: 340500.00,
      usdBalance: 45000.00,
      kycTier: 1,
      status: 'SUSPENDED',
      dailyLimit: 50000,
      dailyUsed: 49500,
      registeredDate: '2026-10-01',
      lastActive: '3 hours ago',
      township: 'Maungdaw',
      complianceNotes: 'Suspended pending KYC document review. High velocity alert.',
    },
    {
      uid: '202610190007',
      name: 'Unknown Operator #7',
      username: '@shadow_flow',
      phone: '+95 9 999 888 777',
      email: 'suspicious_node@proton.me',
      walletAddress: '0xfa019284710294829104829104fa2891',
      akdBalance: 9800.00,
      usdBalance: 0.00,
      kycTier: 1,
      status: 'FROZEN',
      dailyLimit: 0,
      dailyUsed: 0,
      registeredDate: '2026-10-15',
      lastActive: '1 day ago',
      township: 'Sittwe',
      complianceNotes: 'Wallet frozen by AML automated circuit breaker: rapid micro-mixing detected.',
    },
  ]);

  // System Audit Stream
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([
    {
      id: 'AUD-9941',
      timestamp: '14:28:10',
      operator: 'ROOT-OPERATOR-01',
      category: 'KYC',
      action: 'APPROVE_TIER_2',
      details: 'Approved Tier-2 National ID verification for Daw Nu Nu Wai (KYC-800)',
      targetId: '202610190006',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9940',
      timestamp: '14:15:02',
      operator: 'AML-AUTO-ENGINE',
      category: 'SECURITY',
      action: 'SUSPECT_VELOCITY_QUARANTINE',
      details: 'Quarantined incoming remittance corridor for UID 202610190007 (Rate limit exceeded)',
      targetId: '202610190007',
      status: 'WARNING',
    },
    {
      id: 'AUD-9939',
      timestamp: '13:58:44',
      operator: 'ROOT-OPERATOR-01',
      category: 'USER_CONTROL',
      action: 'LIMIT_ADJUST',
      details: 'Increased daily merchant settlement limit to 300,000 AKD for U San Kyaw',
      targetId: '202610190003',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9938',
      timestamp: '13:30:19',
      operator: 'CONSENSUS_ENGINE',
      category: 'LEDGER',
      action: 'EPOCH_SETTLEMENT',
      details: 'Settled 1,894 blocks with 42/42 validator signatures. 0 orphaned transactions.',
      targetId: 'BLOCK-1894204',
      status: 'SUCCESS',
    },
    {
      id: 'AUD-9937',
      timestamp: '12:44:00',
      operator: 'SYSTEM_POLICY',
      category: 'POLICY',
      action: 'RESERVE_AUDIT',
      details: '100% USDT 1:1 Treasury Vault Reserve parity verified. No variance.',
      targetId: 'VAULT-USDT-RESERVE',
      status: 'SUCCESS',
    },
  ]);

  // Consensus Validators
  const [nodesList] = useState<ValidatorNode[]>([
    { id: 'NODE-01', name: 'Sittwe Central Ledger Engine #01', region: 'Sittwe Central (HQ)', ip: '194.26.112.10', ping: 12, uptime: '99.999%', state: 'Active Master', blockHeight: 1894204, peers: 41, cpu: 28, mem: 44 },
    { id: 'NODE-02', name: 'Mrauk-U Heritage Validator #02', region: 'Mrauk-U Station', ip: '194.26.112.11', ping: 18, uptime: '99.995%', state: 'Active Validator', blockHeight: 1894204, peers: 41, cpu: 22, mem: 38 },
    { id: 'NODE-03', name: 'Kyaukphyu Deep Seaport Relay #03', region: 'Kyaukphyu Port Area', ip: '194.26.112.12', ping: 15, uptime: '99.998%', state: 'Active Validator', blockHeight: 1894204, peers: 41, cpu: 34, mem: 52 },
    { id: 'NODE-04', name: 'Thandwe Beach Gateway Node #04', region: 'Thandwe Coastal', ip: '194.26.112.13', ping: 24, uptime: '99.991%', state: 'Active Validator', blockHeight: 1894204, peers: 40, cpu: 19, mem: 35 },
    { id: 'NODE-05', name: 'Maungdaw Border Trade Node #05', region: 'Maungdaw Border Zone', ip: '194.26.112.14', ping: 29, uptime: '99.982%', state: 'Active Validator', blockHeight: 1894204, peers: 39, cpu: 41, mem: 58 },
    { id: 'NODE-06', name: 'Minbya Valley Relay #06', region: 'Minbya Highway Hub', ip: '194.26.112.15', ping: 21, uptime: '99.994%', state: 'Active Validator', blockHeight: 1894204, peers: 41, cpu: 18, mem: 32 },
    { id: 'NODE-07', name: 'Ann Mountain Spine Validator #07', region: 'Ann Transit Corridor', ip: '194.26.112.16', ping: 26, uptime: '99.989%', state: 'Active Validator', blockHeight: 1894204, peers: 41, cpu: 25, mem: 40 },
    { id: 'NODE-08', name: 'Pauktaw Island Mesh Relay #08', region: 'Pauktaw Maritime Zone', ip: '194.26.112.17', ping: 22, uptime: '99.993%', state: 'Active Validator', blockHeight: 1894204, peers: 41, cpu: 16, mem: 30 },
  ]);

  // Monetary Policies
  const [p2pFee, setP2pFee] = useState<number>(0.00);
  const [merchantFee, setMerchantFee] = useState<number>(0.00);
  const [meshVoucherCeiling, setMeshVoucherCeiling] = useState<number>(250.00);
  const [reserveRatio, setReserveRatio] = useState<number>(100.00);
  const [dailyTier1Limit, setDailyTier1Limit] = useState<number>(50000);
  const [dailyTier2Limit, setDailyTier2Limit] = useState<number>(250000);

  // Load Transactions & Persistent Data on Mount
  useEffect(() => {
    loadTransactions();
    loadUsers();
  }, []);

  const loadTransactions = async () => {
    setLoadingTxs(true);
    try {
      const txs = await fetchTransactionsFromDb();
      if (txs && txs.length > 0) {
        setTxList(txs);
      } else {
        // Fallback realistic ledger sample if DB empty
        setTxList([
          {
            id: 'TX-901',
            refId: 'PETH-2026-9901',
            title: 'P2P Instant Transfer',
            titleMm: 'လူအချင်းချင်းငွေလွှဲခြင်း',
            category: 'transfer',
            amount: 2500.00,
            currency: 'AKD',
            time: '14:22:10 Today',
            status: 'SETTLED',
            counterparty: 'Ma Khin Thet (@khinthet)',
            counterpartyMm: 'မခင်သက်',
            fee: 0.00,
            hash: '0x9fa1c8291048ba928471038291048291bc',
          },
          {
            id: 'TX-902',
            refId: 'PETH-2026-9902',
            title: 'Arakan QR Merchant Settlement',
            titleMm: 'Arakan QR ကုန်သည်ငွေရှင်းခြင်း',
            category: 'pos',
            amount: 14200.00,
            currency: 'AKD',
            time: '14:10:45 Today',
            status: 'SETTLED',
            counterparty: 'Sittwe Central Market Store #14',
            counterpartyMm: 'စစ်တွေစျေးမကြီး ဆိုင်အမှတ် ၁၄',
            fee: 0.00,
            hash: '0x718a9c81928471048291048291048291ef',
          },
          {
            id: 'TX-903',
            refId: 'PETH-2026-9903',
            title: 'Cross-Border USDT Remittance',
            titleMm: 'နိုင်ငံတကာငွေလွှဲ အပ်နှံမှု',
            category: 'remittance',
            amount: 1000.00,
            currency: 'USD',
            time: '13:45:00 Today',
            status: 'SETTLED',
            counterparty: 'Bangkok FX Corridor Gate',
            counterpartyMm: 'ဘန်ကောက် ငွေလွှဲစင်တာ',
            fee: 0.00,
            hash: '0xbb294018294829104829104829104829a1',
          },
          {
            id: 'TX-904',
            refId: 'PETH-2026-9904',
            title: 'Agent Physical Float Cash-In',
            titleMm: 'ကိုယ်စားလှယ် ငွေသားသွင်းခြင်း',
            category: 'cashout',
            amount: 50000.00,
            currency: 'AKD',
            time: '12:30:15 Today',
            status: 'SETTLED',
            counterparty: 'Kyaukphyu Seaport Agency #03',
            counterpartyMm: 'ကျောက်ဖြူဆိပ်ကမ်း ကိုယ်စားလှယ် #၀၃',
            fee: 0.00,
            hash: '0x4910482910482910482910482910482902',
          },
          {
            id: 'TX-905',
            refId: 'PETH-2026-9905',
            title: 'Offline BLE Mesh Voucher Redeem',
            titleMm: 'အင်တာနက်မဲ့ Mesh Voucher ငွေထုတ်',
            category: 'transfer',
            amount: 250.00,
            currency: 'AKD',
            time: '11:15:30 Today',
            status: 'SETTLED',
            counterparty: 'Mrauk-U Rural Relay Node',
            counterpartyMm: 'မြောက်ဦး ကျေးလက် ဆက်ကြောင်း',
            fee: 0.00,
            hash: '0x5501928471048291048291048291048293',
          },
        ]);
      }
    } catch (err) {
      console.warn('Error loading transactions:', err);
    } finally {
      setLoadingTxs(false);
    }
  };

  const loadUsers = async () => {
    try {
      const dbUsers = await fetchAllUsersForAdmin();
      if (dbUsers && dbUsers.length > 0) {
        // Merge DB profiles with state if any new users exist
        setUsersList((prev) => {
          const existingUids = new Set(prev.map(u => u.uid));
          const newEntries: AdminUserRecord[] = dbUsers
            .filter(u => !existingUids.has(u.uid))
            .map(u => ({
              uid: u.uid,
              name: u.name,
              username: u.username || `@${u.name.toLowerCase().replace(/\s+/g, '')}`,
              phone: u.phone || '+95 9 000 000 000',
              email: u.email || 'user@pethar.co.uk',
              walletAddress: u.walletAddress || u.uid,
              akdBalance: u.akdWalletBalance || u.balance || 0,
              usdBalance: u.usdAccountBalance || 0,
              kycTier: u.kyc_tier || 1,
              status: 'ACTIVE',
              dailyLimit: 50000,
              dailyUsed: 0,
              registeredDate: '2026-10-19',
              lastActive: 'Active',
              township: 'Sittwe',
              complianceNotes: 'Registered user via mobile/web client.',
            }));
          return [...prev, ...newEntries];
        });
      }
    } catch (err) {
      console.warn('Error fetching all users for admin:', err);
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleRefreshTelemetry = async () => {
    setIsRefreshing(true);
    await loadTransactions();
    await loadUsers();
    setTimeout(() => {
      setIsRefreshing(false);
      triggerToast(isAk ? 'စနစ်အချက်အလက်များနှင့် တိုက်ရိုက်ဒေတာများ ပြန်လည်မွမ်းမံပြီးပါပြီ' : 'System telemetry and live ledger updated successfully');
    }, 600);
  };

  // --- KYC APPROVAL & REJECTION ACTIONS ---

  const handleApproveKyc = async (applicant: KycApplicant) => {
    // 1. Update KYC Queue
    setKycQueue(prev => prev.map(k => k.id === applicant.id ? { ...k, status: 'Approved' } : k));

    // 2. Elevate user in usersList to Tier 2
    setUsersList(prev => prev.map(u => u.uid === applicant.uid ? {
      ...u,
      kycTier: 2,
      dailyLimit: Math.max(u.dailyLimit, 250000),
      complianceNotes: `Tier-2 National ID verified by ROOT-OPERATOR-01 on ${new Date().toLocaleDateString()}. NRC: ${applicant.idCard}`
    } : u));

    // 3. Persist to DB
    await updateCitizenKycInDb(applicant.uid, 'verified', 2);

    // 4. Log in Audit Trail
    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'KYC',
      action: 'APPROVE_TIER_2',
      details: `Approved Tier-2 National ID verification for ${applicant.name} (${applicant.idCard}). Daily limit expanded.`,
      targetId: applicant.uid,
      status: 'SUCCESS',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (selectedApplicant?.id === applicant.id) {
      setSelectedApplicant({ ...selectedApplicant, status: 'Approved' });
    }

    triggerToast(
      isAk
        ? `နိုင်ငံသား ${applicant.nameMm || applicant.name} ၏ KYC Level 2 အောင်မြင်စွာ အတည်ပြုပြီးပါပြီ`
        : `KYC Tier-2 approved for ${applicant.name}. Citizen elevated to Verified status.`
    );
  };

  const handleOpenRejectModal = (applicant: KycApplicant) => {
    setSelectedApplicant(applicant);
    setRejectModalOpen(true);
  };

  const handleConfirmRejectKyc = async () => {
    if (!selectedApplicant) return;

    const fullReason = customRejectNote ? `${selectedRejectReason} (${customRejectNote})` : selectedRejectReason;

    // 1. Update KYC Queue
    setKycQueue(prev => prev.map(k => k.id === selectedApplicant.id ? {
      ...k,
      status: 'Rejected',
      rejectionReason: fullReason,
    } : k));

    // 2. Persist to DB
    await updateCitizenKycInDb(selectedApplicant.uid, 'rejected', 1, fullReason);

    // 3. Add to Audit
    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'KYC',
      action: 'REJECT_TIER_2',
      details: `Rejected Tier-2 KYC for ${selectedApplicant.name} (${selectedApplicant.idCard}). Reason: ${fullReason}`,
      targetId: selectedApplicant.uid,
      status: 'WARNING',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setRejectModalOpen(false);
    setSelectedApplicant(prev => prev ? { ...prev, status: 'Rejected', rejectionReason: fullReason } : null);
    setCustomRejectNote('');

    triggerToast(
      isAk
        ? `လျှောက်ထားမှု ${selectedApplicant.id} ကို ပယ်ချပြီး အကြောင်းကြားစာ ပေးပို့ပြီးပါပြီ`
        : `KYC application ${selectedApplicant.id} rejected. Citizen notification dispatched.`
    );
  };

  const handleFlagKyc = (applicant: KycApplicant) => {
    setKycQueue(prev => prev.map(k => k.id === applicant.id ? { ...k, status: 'Flagged', riskScore: 'High' } : k));

    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'SECURITY',
      action: 'FLAG_COMPLIANCE_INVESTIGATION',
      details: `Escalated KYC ${applicant.id} (${applicant.name}) to Compliance & AML Special Review.`,
      targetId: applicant.uid,
      status: 'CRITICAL',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (selectedApplicant?.id === applicant.id) {
      setSelectedApplicant({ ...selectedApplicant, status: 'Flagged', riskScore: 'High' });
    }

    triggerToast(
      isAk
        ? `လျှောက်ထားသူ ${applicant.name} အား အထူးစုံစမ်းစစ်ဆေးရေးသို့ အလံပြ လွှဲပြောင်းထားပါသည်`
        : `Citizen ${applicant.name} flagged for Special Compliance & AML Investigation.`
    );
  };

  // --- USER CONTROL & MANAGEMENT ACTIONS ---

  const handleOpenUserControl = (user: AdminUserRecord) => {
    setSelectedUser(user);
    setNewDailyLimit(user.dailyLimit);
    setUserActionReason('');
    setUserControlModalOpen(true);
  };

  const handleToggleFreezeUser = async (user: AdminUserRecord) => {
    const nextStatus: 'ACTIVE' | 'FROZEN' = user.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN';
    const actionDesc = nextStatus === 'FROZEN' ? 'FROZE_USER_WALLET' : 'UNFROZE_USER_WALLET';
    const reasonText = userActionReason.trim() || (nextStatus === 'FROZEN' ? 'Administrative security hold' : 'Operator lifted restriction');

    // Update local state
    setUsersList(prev => prev.map(u => u.uid === user.uid ? {
      ...u,
      status: nextStatus,
      complianceNotes: `${reasonText} [${new Date().toLocaleDateString()}]`,
    } : u));

    if (selectedUser?.uid === user.uid) {
      setSelectedUser({
        ...selectedUser,
        status: nextStatus,
        complianceNotes: `${reasonText} [${new Date().toLocaleDateString()}]`,
      });
    }

    // Persist to DB
    await updateUserStatusInDb(user.uid, nextStatus, reasonText);

    // Audit log
    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'USER_CONTROL',
      action: actionDesc,
      details: `${nextStatus === 'FROZEN' ? 'Frozen' : 'Restored'} citizen wallet ${user.username} (${user.uid}). Reason: ${reasonText}`,
      targetId: user.uid,
      status: nextStatus === 'FROZEN' ? 'CRITICAL' : 'SUCCESS',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    triggerToast(
      isAk
        ? `အသုံးပြုသူ ${user.name} ၏ အကောင့်ကို ${nextStatus === 'FROZEN' ? 'ပိတ်ပင်ကန့်သတ်လိုက်ပါပြီ (Frozen)' : 'ပုံမှန်အသုံးပြုခွင့် ပြန်လည်ပေးအပ်ပါပြီ (Active)'}`
        : `User ${user.username} status updated to ${nextStatus}.`
    );
  };

  const handleToggleSuspendUser = async (user: AdminUserRecord) => {
    const nextStatus: 'ACTIVE' | 'SUSPENDED' = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const reasonText = userActionReason.trim() || 'Temporary operational review';

    setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, status: nextStatus } : u));
    if (selectedUser?.uid === user.uid) {
      setSelectedUser({ ...selectedUser, status: nextStatus });
    }

    await updateUserStatusInDb(user.uid, nextStatus, reasonText);

    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'USER_CONTROL',
      action: nextStatus === 'SUSPENDED' ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
      details: `${nextStatus === 'SUSPENDED' ? 'Suspended' : 'Reactivated'} citizen ${user.name}. Reason: ${reasonText}`,
      targetId: user.uid,
      status: nextStatus === 'SUSPENDED' ? 'WARNING' : 'SUCCESS',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    triggerToast(
      isAk
        ? `အသုံးပြုသူ ${user.name} ၏ အကောင့်အခြေအနေ: ${nextStatus}`
        : `User ${user.username} status changed to ${nextStatus}`
    );
  };

  const handleSaveDailyLimit = (user: AdminUserRecord) => {
    setUsersList(prev => prev.map(u => u.uid === user.uid ? { ...u, dailyLimit: newDailyLimit } : u));
    if (selectedUser?.uid === user.uid) {
      setSelectedUser({ ...selectedUser, dailyLimit: newDailyLimit });
    }

    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'USER_CONTROL',
      action: 'UPDATE_DAILY_LIMIT',
      details: `Updated daily transaction ceiling for ${user.username} to ${newDailyLimit.toLocaleString()} AKD.`,
      targetId: user.uid,
      status: 'SUCCESS',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    triggerToast(
      isAk
        ? `နေ့စဉ် ငွေလွှဲကန့်သတ်ချက်ကို ${newDailyLimit.toLocaleString()} AKD သို့ ပြင်ဆင်ပြီးပါပြီ`
        : `Daily limit adjusted to ${newDailyLimit.toLocaleString()} AKD for ${user.username}`
    );
  };

  const handleResetPinForUser = (user: AdminUserRecord) => {
    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'USER_CONTROL',
      action: 'FORCE_PIN_RESET',
      details: `Flagged user ${user.username} (${user.uid}) for mandatory 6-digit security PIN reset on next login.`,
      targetId: user.uid,
      status: 'WARNING',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    triggerToast(
      isAk
        ? `အသုံးပြုသူ ${user.name} အား လာမည့် ဝင်ရောက်မှုတွင် PIN နံပါတ် အသစ်ပြန်လည်သတ်မှတ်ရန် ညွှန်ကြားလိုက်ပါပြီ`
        : `Mandatory PIN reset flag placed on ${user.username}. Session terminated.`
    );
  };

  // --- EXPORT MASTER LEDGER CSV ---
  const handleExportCsv = () => {
    const headers = ['RefID', 'TxHash', 'Category', 'Counterparty', 'Amount', 'Currency', 'Fee', 'Status', 'Timestamp'];
    const rows = txList.map(tx => [
      `"${tx.refId}"`,
      `"${tx.hash}"`,
      `"${tx.category}"`,
      `"${tx.counterparty.replace(/"/g, '""')}"`,
      tx.amount,
      `"${tx.currency}"`,
      tx.fee,
      `"${tx.status}"`,
      `"${tx.time}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pethar-master-ledger-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(isAk ? 'စာရင်းစစ် မှတ်တမ်းအပြည့်အစုံ CSV ကို ဒေါင်းလုဒ်လုပ်ပြီးပါပြီ' : 'Master Cryptographic Ledger exported to CSV');
  };

  // --- EXPORT CITIZENS DIRECTORY CSV WITH EMAILS ---
  const handleExportCitizensCsv = () => {
    const headers = ['UID', 'Name', 'Username', 'Email', 'Phone', 'Wallet Address', 'AKD Balance', 'USD Balance', 'Total Balance', 'KYC Level', 'Status', 'Registered Date', 'Township'];
    const rows = usersList.map(u => [
      `"${u.uid}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.username.replace(/"/g, '""')}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.phone || '').replace(/"/g, '""')}"`,
      `"${u.walletAddress}"`,
      u.akdBalance,
      u.usdBalance,
      (u.akdBalance + u.usdBalance),
      `"KYC Level ${u.kycTier}"`,
      `"${u.status}"`,
      `"${u.registeredDate}"`,
      `"${u.township}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pethar-citizens-directory-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(isAk ? 'နိုင်ငံသားများ အချက်အလက်နှင့် အီးမေးလ်စာရင်း CSV ကို ဒေါင်းလုဒ်လုပ်ပြီးပါပြီ' : 'Citizens Directory with Emails exported to CSV');
  };

  // --- EMERGENCY CIRCUIT BREAKER ---
  const handleToggleCircuitBreaker = () => {
    if (circuitBreakerPin !== '9991') {
      alert(isAk ? 'အရေးပေါ် PIN နံပါတ် မှားယွင်းနေပါသည်။ (စမ်းသပ်ရန် PIN: 9991)' : 'Invalid Emergency Security Override PIN. (Demo PIN: 9991)');
      return;
    }

    const nextState = !circuitBreakerActive;
    setCircuitBreakerActive(nextState);
    setCircuitBreakerOpen(false);
    setCircuitBreakerPin('');

    const newLog: SystemAuditLog = {
      id: `AUD-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      operator: 'ROOT-OPERATOR-01',
      category: 'SECURITY',
      action: nextState ? 'CIRCUIT_BREAKER_ENGAGED' : 'CIRCUIT_BREAKER_DISENGAGED',
      details: nextState
        ? 'GLOBAL SETTLEMENT PAUSED: Emergency circuit breaker engaged across all 42 regional consensus nodes.'
        : 'GLOBAL SETTLEMENT RESUMED: Circuit breaker disengaged. Standard ledger operations restored.',
      targetId: 'CONSENSUS_GLOBAL',
      status: nextState ? 'CRITICAL' : 'SUCCESS',
    };
    setAuditLogs(prev => [newLog, ...prev]);

    triggerToast(
      nextState
        ? (isAk ? 'သတိပေးချက်: ကွန်ရက်ငွေလွှဲပြောင်းမှု အားလုံးကို အရေးပေါ် ခေတ္တရပ်ဆိုင်းထားပါသည်' : 'CRITICAL: Regional Settlement Circuit Breaker Engaged. All transfers frozen.')
        : (isAk ? 'ကွန်ရက်ပုံမှန် ငွေလွှဲပြောင်းမှုများကို ပြန်လည်ဖွင့်လှစ်လိုက်ပါပြီ' : 'Circuit Breaker Disengaged. Normal consensus operations restored.')
    );
  };

  // Filtered KYC applications
  const filteredKyc = useMemo(() => {
    return kycQueue.filter(k => {
      const matchesFilter =
        kycFilter === 'all' ? true :
        kycFilter === 'pending' ? k.status === 'Pending' :
        kycFilter === 'approved' ? k.status === 'Approved' :
        kycFilter === 'rejected' ? k.status === 'Rejected' :
        kycFilter === 'flagged' ? k.status === 'Flagged' : true;

      const q = kycSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        k.name.toLowerCase().includes(q) ||
        k.nameMm.toLowerCase().includes(q) ||
        k.idCard.toLowerCase().includes(q) ||
        k.township.toLowerCase().includes(q) ||
        k.uid.includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [kycQueue, kycFilter, kycSearch]);

  // Filtered User list
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesStatus = userFilter === 'all' || u.status === userFilter;
      const matchesTier = userTierFilter === 'all' || (userTierFilter === 'tier1' ? u.kycTier === 1 : u.kycTier === 2);
      const q = userSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.uid.includes(q) ||
        u.walletAddress.toLowerCase().includes(q);

      return matchesStatus && matchesTier && matchesSearch;
    });
  }, [usersList, userFilter, userTierFilter, userSearch]);

  // Filtered Audit logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesCat = auditCategoryFilter === 'all' || log.category === auditCategoryFilter;
      const q = auditSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        log.details.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [auditLogs, auditCategoryFilter, auditSearch]);

  // Filtered Transactions
  const filteredTxs = useMemo(() => {
    return txList.filter(tx => {
      const matchesCat = auditCategoryFilter === 'all' || tx.category === auditCategoryFilter;
      const q = auditSearch.toLowerCase().trim();
      const matchesSearch = !q ||
        tx.refId.toLowerCase().includes(q) ||
        tx.counterparty.toLowerCase().includes(q) ||
        tx.hash.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [txList, auditCategoryFilter, auditSearch]);

  // Translations
  const t = isAk
    ? {
        title: 'ဖေ့သာ ဗဟိုဘဏ္ဍာရေး စီမံခန့်ခွဲမှုနှင့် အုပ်ချုပ်ရေးဌာန',
        badge: 'အဆင့်မြင့် အုပ်ချုပ်သူ သီးသန့်စနစ် (Super-Admin Console)',
        subtitle: 'တိုက်ရိုက်ကွန်ရက် စောင့်ကြည့်လေ့လာရေး၊ နိုင်ငံသား Tier-2 KYC စိစစ်အတည်ပြုမှုနှင့် သုံးစွဲသူထိန်းချုပ်ရေး ဗဟိုစနစ်',
        tabMonitoring: 'တိုက်ရိုက်စောင့်ကြည့်မှု (Monitoring)',
        tabKyc: 'KYC စိစစ်အတည်ပြုရေး (KYC Hub)',
        tabUsers: 'အသုံးပြုသူများ စီမံခန့်ခွဲရေး (User Control)',
        tabAudit: 'စာရင်းစစ် မှတ်တမ်းများ (Ledger Audit)',
        tabPolicy: 'ငွေကြေးမူဝါဒနှင့် ကန့်သတ်ချက် (Policies)',
        tabNodes: 'ကွန်ရက်နုတ်ဒ်များ (Nodes)',
      }
    : {
        title: 'Péthar Monetary Authority & Super-Admin Console',
        badge: 'Authorized Personnel Only (Super-Admin Clear Level 5)',
        subtitle: 'Real-time telemetry, citizen Tier-2 KYC governance & approvals, and comprehensive user account control center',
        tabMonitoring: 'Monitoring & Telemetry',
        tabKyc: 'Citizen KYC Hub',
        tabUsers: 'Citizen Control & Directory',
        tabAudit: 'Ledger Master Audit',
        tabPolicy: 'Monetary & Risk Policies',
        tabNodes: 'Validator Nodes',
      };

  return (
    <BaseLayout
      title={t.title}
      lang={lang}
      showHeader={true}
      showFooter={true}
    >
      <div className="space-y-6 pb-12">

        {/* System Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 max-w-md bg-slate-900 border border-emerald-500/50 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs font-mono">{toastMessage}</div>
            <button onClick={() => setToastMessage(null)} className="ml-auto text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Emergency Circuit Breaker Banner (If engaged) */}
        {circuitBreakerActive && (
          <div className="bg-red-950/90 border-2 border-red-500 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse shadow-2xl">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
              <div>
                <div className="text-sm font-black font-mono tracking-wider uppercase text-red-200">
                  {isAk ? 'အရေးပေါ် ကွန်ရက်ရပ်ဆိုင်းမှု စနစ် အသက်ဝင်နေပါသည်' : 'CRITICAL EMERGENCY CIRCUIT BREAKER ENGAGED'}
                </div>
                <div className="text-xs text-red-300">
                  {isAk ? 'ငွေလွှဲပြောင်းမှုနှင့် အတည်ပြုချက်များ အားလုံးကို ယာယီ ရပ်တန့်ထားပါသည်' : 'All outbound ledger transactions and settlements have been frozen by root operator.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setCircuitBreakerOpen(true);
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-mono font-bold transition shadow-lg shrink-0"
            >
              {isAk ? 'ထိန်းချုပ်မှု ပြန်လည်ဖွင့်ရန်' : 'Disengage Circuit Breaker'}
            </button>
          </div>
        )}

        {/* Executive Admin Header Card with Glassmorphic Obsidian Aesthetics */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl relative overflow-hidden">
          {/* Subtle Cyber Accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Top Command Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <span>{t.title}</span>
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Operator Session & Emergency Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <span className="text-slate-400">OPERATOR: </span>
                  <span className="font-bold text-emerald-400">ROOT-01</span>
                </div>
              </div>

              <button
                onClick={handleRefreshTelemetry}
                disabled={isRefreshing}
                className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-slate-200 transition flex items-center gap-2"
                title="Refresh Telemetry"
              >
                <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-amber-400' : 'text-slate-400'} />
                <span>{isAk ? 'ဒေတာသစ်တင်ရန်' : 'Refresh'}</span>
              </button>

              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-slate-200 transition flex items-center gap-2"
                title="Export Master Ledger CSV"
              >
                <Download size={13} className="text-slate-400" />
                <span>CSV</span>
              </button>

              <button
                onClick={() => setCircuitBreakerOpen(true)}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                  circuitBreakerActive
                    ? 'bg-red-600 border-red-500 text-white animate-pulse'
                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                }`}
              >
                <AlertTriangle size={13} />
                <span>{circuitBreakerActive ? 'FREEZE ACTIVE' : 'Kill-Switch'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Telemetry Bar (6 KPIs) */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">24h Net Settlement</div>
              <div className="text-lg sm:text-xl font-black font-mono text-amber-400 mt-1">
                ₳ 1,489,200
              </div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5 flex items-center gap-1">
                <ArrowUpRight size={10} />
                <span>+16.4% volume</span>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">Registered Citizens</div>
              <div className="text-lg sm:text-xl font-black font-mono text-white mt-1">
                {usersList.length.toLocaleString()} Active
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {usersList.filter(u => u.kycTier === 2).length} Tier-2 Verified
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">KYC Pending Queue</div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-1">
                {kycQueue.filter(k => k.status === 'Pending').length} Pending
              </div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                ~4.2m avg decision latency
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">Consensus Nodes</div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-1">
                42 / 42 Online
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                14ms regional latency
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">USDT Reserve Backing</div>
              <div className="text-lg sm:text-xl font-black font-mono text-cyan-400 mt-1">
                100.00%
              </div>
              <div className="text-[10px] text-cyan-300 font-mono mt-0.5">
                1:1 Treasury Vault Parity
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl p-3.5 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">AML Security Shield</div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-1">
                SECURE
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {usersList.filter(u => u.status === 'FROZEN').length} Wallets Quarantined
              </div>
            </div>
          </div>
        </div>

        {/* Master Operational Navigation Tabs */}
        <div className="flex p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-x-auto text-xs font-mono font-bold gap-1">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'monitoring'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{t.tabMonitoring}</span>
          </button>

          <button
            onClick={() => setActiveTab('kyc')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all whitespace-nowrap relative ${
              activeTab === 'kyc'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t.tabKyc}</span>
            {kycQueue.filter(k => k.status === 'Pending').length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
                {kycQueue.filter(k => k.status === 'Pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t.tabUsers}</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{t.tabAudit}</span>
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'policy'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.tabPolicy}</span>
          </button>

          <button
            onClick={() => setActiveTab('nodes')}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'nodes'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{t.tabNodes}</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            TAB 1: SYSTEM MONITORING & TELEMETRY
            ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            {/* Visual Throughput & Settlement Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hourly Throughput Bar Visualizer */}
              <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Activity size={16} className="text-amber-400" />
                      <span>{isAk ? '၂၄ နာရီ ငွေလွှဲပြောင်းမှုနှင့် ရှင်းလင်းမှု သိပ်သည်းဆ' : '24-Hour Settlement Throughput & Peak Velocity'}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {isAk ? 'ကွန်ရက်ပေါ်ရှိ P2P၊ QR ငွေပေးချေမှုနှင့် ကုန်သွယ်ရေး ငွေပမာဏ' : 'Breakdown across P2P, Merchant QR, and Treasury Liquidity pools'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> P2P</span>
                    <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> QR Merchant</span>
                    <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Remittance</span>
                  </div>
                </div>

                {/* Styled Hourly Histogram Bars */}
                <div className="h-48 pt-4 flex items-end justify-between gap-1 sm:gap-2">
                  {[
                    { hour: '00:00', p2p: 35, qr: 15, rem: 10, vol: '₳ 45k' },
                    { hour: '02:00', p2p: 20, qr: 10, rem: 8, vol: '₳ 28k' },
                    { hour: '04:00', p2p: 18, qr: 8, rem: 5, vol: '₳ 22k' },
                    { hour: '06:00', p2p: 45, qr: 30, rem: 15, vol: '₳ 75k' },
                    { hour: '08:00', p2p: 75, qr: 60, rem: 35, vol: '₳ 145k' },
                    { hour: '10:00', p2p: 95, qr: 85, rem: 55, vol: '₳ 210k' },
                    { hour: '12:00', p2p: 110, qr: 95, rem: 60, vol: '₳ 248k' },
                    { hour: '14:00', p2p: 125, qr: 105, rem: 70, vol: '₳ 285k' },
                    { hour: '16:00', p2p: 100, qr: 88, rem: 50, vol: '₳ 220k' },
                    { hour: '18:00', p2p: 85, qr: 70, rem: 40, vol: '₳ 180k' },
                    { hour: '20:00', p2p: 60, qr: 45, rem: 25, vol: '₳ 115k' },
                    { hour: '22:00', p2p: 42, qr: 25, rem: 15, vol: '₳ 68k' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="w-full max-w-[28px] flex flex-col justify-end h-36 gap-0.5">
                        <div style={{ height: `${item.rem * 0.4}%` }} className="w-full bg-cyan-400 rounded-t-xs" />
                        <div style={{ height: `${item.qr * 0.4}%` }} className="w-full bg-emerald-400" />
                        <div style={{ height: `${item.p2p * 0.4}%` }} className="w-full bg-amber-400 rounded-b-xs" />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500">{item.hour}</span>

                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-slate-950 border border-slate-700 text-white px-2 py-1 rounded text-[10px] font-mono opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 whitespace-nowrap shadow-xl">
                        {item.vol} @ {item.hour}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
                  <div>Peak TPS: <span className="font-bold text-emerald-400">284 TPS</span></div>
                  <div>Average Latency: <span className="font-bold text-white">12.4ms</span></div>
                  <div>Settlement Consensus: <span className="font-bold text-amber-400">Instant Finality</span></div>
                </div>
              </div>

              {/* Regional Heatmap & Liquidity Breakdown */}
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <Radio size={16} className="text-red-400" />
                    <span>{isAk ? 'ဒေသအလိုက် ငွေလွှဲပြောင်းမှု သိပ်သည်းဆ' : 'Township Liquidity Density'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {isAk ? 'အာရက္ခ ဒေသကြီး မြို့နယ်များအလိုက်' : 'Regional breakdown across Arakan State'}
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {[
                    { name: 'Sittwe · စစ်တွေ', pct: 42, amount: '₳ 625,400', color: 'bg-red-500' },
                    { name: 'Kyaukphyu · ကျောက်ဖြူ', pct: 24, amount: '₳ 357,400', color: 'bg-amber-500' },
                    { name: 'Mrauk-U · မြောက်ဦး', pct: 16, amount: '₳ 238,200', color: 'bg-emerald-500' },
                    { name: 'Thandwe · သံတွဲ', pct: 10, amount: '₳ 148,900', color: 'bg-cyan-500' },
                    { name: 'Maungdaw · မောင်တော', pct: 5, amount: '₳ 74,400', color: 'bg-purple-500' },
                    { name: 'Minbya & Others · အခြား', pct: 3, amount: '₳ 44,900', color: 'bg-slate-500' },
                  ].map((town, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 font-medium">{town.name}</span>
                        <span className="text-slate-400">{town.amount} ({town.pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${town.pct}%` }}
                          className={`h-full ${town.color} rounded-full transition-all duration-500`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Security & Telemetry Audit Stream */}
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <ShieldAlert size={16} className="text-emerald-400" />
                    <span>{isAk ? 'တိုက်ရိုက် စနစ်လှုပ်ရှားမှုနှင့် အုပ်ချုပ်ရေး မှတ်တမ်း' : 'Real-Time Operational Security & Admin Stream'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {isAk ? 'စနစ်မှ အလိုအလျောက် မှတ်တမ်းတင်ထားသော လုပ်ဆောင်ချက်များ' : 'Cryptographically signed audit logs of operator interventions and AML automated actions'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  LIVE STREAM
                </span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {filteredAuditLogs.slice(0, 8).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        log.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        log.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {log.category === 'KYC' && <UserCheck size={14} />}
                        {log.category === 'USER_CONTROL' && <SlidersHorizontal size={14} />}
                        {log.category === 'SECURITY' && <ShieldAlert size={14} />}
                        {log.category === 'LEDGER' && <Activity size={14} />}
                        {log.category === 'POLICY' && <Sliders size={14} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{log.action}</span>
                          <span className="text-[10px] text-slate-500 font-normal">[{log.category}]</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-[11px] self-end md:self-center">
                      <span className="text-slate-500">{log.operator}</span>
                      <span className="text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 2: KYC VERIFICATION & APPROVAL HUB
            ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
              {/* Header & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <span>{isAk ? 'နိုင်ငံသား Tier-2 KYC စိစစ်အတည်ပြုရေး စင်တာ' : 'Citizen Tier-2 KYC Verification & Approval Hub'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {isAk ? 'အာရက္ခ နိုင်ငံသားမှတ်ပုံတင်၊ မျက်နှာစစ်ဆေးမှုနှင့် လိပ်စာ အတည်ပြုချက်များ' : 'Review biometric face matching, national identity cards, and civil registry cross-checks'}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {(['pending', 'all', 'approved', 'rejected', 'flagged'] as const).map((filterKey) => {
                    const count =
                      filterKey === 'all' ? kycQueue.length :
                      filterKey === 'pending' ? kycQueue.filter(k => k.status === 'Pending').length :
                      filterKey === 'approved' ? kycQueue.filter(k => k.status === 'Approved').length :
                      filterKey === 'rejected' ? kycQueue.filter(k => k.status === 'Rejected').length :
                      kycQueue.filter(k => k.status === 'Flagged').length;

                    return (
                      <button
                        key={filterKey}
                        onClick={() => setKycFilter(filterKey)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                          kycFilter === filterKey
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="capitalize">{filterKey}</span>
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          kycFilter === filterKey ? 'bg-red-800 text-white' : 'bg-slate-700 text-slate-300'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search & Statistics Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={kycSearch}
                    onChange={(e) => setKycSearch(e.target.value)}
                    placeholder={isAk ? 'နာမည်၊ မှတ်ပုံတင်၊ မြို့နယ် သို့မဟုတ် UID ရှာရန်...' : 'Search applicant name, NRC ID, township...'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  {kycSearch && (
                    <button onClick={() => setKycSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-400 self-end sm:self-center">
                  Showing <span className="font-bold text-white">{filteredKyc.length}</span> of {kycQueue.length} applicants
                </div>
              </div>

              {/* Applicants List */}
              <div className="space-y-3">
                {filteredKyc.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-2xl">
                    No applicants matching the selected filter.
                  </div>
                ) : (
                  filteredKyc.map((k) => (
                    <div
                      key={k.id}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition shadow-sm"
                    >
                      {/* Left: Applicant Information */}
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-white font-bold flex items-center justify-center shrink-0 relative overflow-hidden">
                          <span className="text-sm font-mono">{k.name.slice(0, 2).toUpperCase()}</span>
                          {k.status === 'Approved' && (
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-tl flex items-center justify-center">
                              <Check size={9} className="text-white" />
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-sm">{k.name}</span>
                            {k.nameMm && <span className="text-xs text-slate-400 font-myanmar">({k.nameMm})</span>}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {k.id}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>{k.township}</span>
                            <span>•</span>
                            <span className="text-amber-400">{k.idCard}</span>
                            <span>•</span>
                            <span>{k.occupation}</span>
                            <span>•</span>
                            <span className="text-slate-500">Submitted {k.submitted}</span>
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {/* Face Match Badge */}
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <Sparkles size={10} />
                              <span>AI Face Match: {k.faceMatchScore}%</span>
                            </span>

                            {/* Risk Rating */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              k.riskScore === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              k.riskScore === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              <span>Risk: {k.riskScore}</span>
                            </span>

                            {/* Status Pill */}
                            <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              k.status === 'Approved' ? 'bg-emerald-600 text-white' :
                              k.status === 'Rejected' ? 'bg-red-600 text-white' :
                              k.status === 'Flagged' ? 'bg-purple-600 text-white' :
                              'bg-amber-400 text-slate-950'
                            }`}>
                              {k.status === 'Approved' && <CheckCircle2 size={10} />}
                              {k.status === 'Rejected' && <XCircle size={10} />}
                              {k.status === 'Flagged' && <AlertTriangle size={10} />}
                              <span>{k.status}</span>
                            </span>

                            {k.rejectionReason && (
                              <span className="text-[10px] text-red-400 font-mono italic">
                                Reason: {k.rejectionReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Decision Action Controls */}
                      <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                        {/* Inspect Dossier Button */}
                        <button
                          onClick={() => setSelectedApplicant(k)}
                          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                        >
                          <Eye size={13} />
                          <span>{isAk ? 'အချက်အလက် စစ်ဆေးမည်' : 'Inspect Dossier'}</span>
                        </button>

                        {k.status === 'Pending' && (
                          <>
                            {/* Approve Tier-2 */}
                            <button
                              onClick={() => handleApproveKyc(k)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition shadow-md"
                            >
                              <CheckCircle2 size={13} />
                              <span>{isAk ? 'အတည်ပြုမည်' : 'Approve Tier 2'}</span>
                            </button>

                            {/* Reject Button */}
                            <button
                              onClick={() => handleOpenRejectModal(k)}
                              className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-mono font-bold flex items-center gap-1.5 transition"
                            >
                              <XCircle size={13} />
                              <span>{isAk ? 'ပယ်ချမည်' : 'Reject'}</span>
                            </button>

                            {/* Flag Button */}
                            <button
                              onClick={() => handleFlagKyc(k)}
                              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-400 transition"
                              title="Flag for AML investigation"
                            >
                              <AlertTriangle size={14} />
                            </button>
                          </>
                        )}

                        {k.status === 'Approved' && (
                          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 font-bold">
                            <BadgeCheck size={16} />
                            <span>Tier-2 Enrolled</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 3: CITIZEN / USER MANAGEMENT & CONTROL
            ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-5">
              {/* Header & Directory Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    <span>{isAk ? 'အသုံးပြုသူ နိုင်ငံသားများ စီမံခန့်ခွဲရေးနှင့် ထိန်းချုပ်ရေး စင်တာ' : 'Citizen Directory & Account Control Center'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {isAk ? 'အကောင့်ပိတ်ပင်ခြင်း၊ ကန့်သတ်ချက် ပြင်ဆင်ခြင်းနှင့် လုံခြုံရေး ထိန်းချုပ်မှုများ' : 'Manage citizen wallets, enforce AML freezes, modify daily volume limits, and inspect audit logs'}
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                    <button
                      onClick={() => setUserFilter('all')}
                      className={`px-3 py-1 rounded-lg ${userFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                    >
                      All ({usersList.length})
                    </button>
                    <button
                      onClick={() => setUserFilter('ACTIVE')}
                      className={`px-3 py-1 rounded-lg ${userFilter === 'ACTIVE' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Active ({usersList.filter(u => u.status === 'ACTIVE').length})
                    </button>
                    <button
                      onClick={() => setUserFilter('SUSPENDED')}
                      className={`px-3 py-1 rounded-lg ${userFilter === 'SUSPENDED' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Suspended ({usersList.filter(u => u.status === 'SUSPENDED').length})
                    </button>
                    <button
                      onClick={() => setUserFilter('FROZEN')}
                      className={`px-3 py-1 rounded-lg ${userFilter === 'FROZEN' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Frozen ({usersList.filter(u => u.status === 'FROZEN').length})
                    </button>
                  </div>

                  <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
                    <button
                      onClick={() => setUserTierFilter('all')}
                      className={`px-3 py-1 rounded-lg ${userTierFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                    >
                      All Tiers
                    </button>
                    <button
                      onClick={() => setUserTierFilter('tier1')}
                      className={`px-3 py-1 rounded-lg ${userTierFilter === 'tier1' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Tier 1
                    </button>
                    <button
                      onClick={() => setUserTierFilter('tier2')}
                      className={`px-3 py-1 rounded-lg ${userTierFilter === 'tier2' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                    >
                      Tier 2
                    </button>
                  </div>

                  <button
                    onClick={handleExportCitizensCsv}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-bold transition shadow-sm cursor-pointer"
                    title="Export Citizens Directory CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isAk ? 'အသုံးပြုသူစာရင်း CSV ထုတ်ယူမည်' : 'Export Citizens CSV'}</span>
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={isAk ? 'အမည်၊ Username၊ ဖုန်း သို့မဟုတ် UID ရှာရန်...' : 'Search name, username, phone, or UID...'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                  />
                  {userSearch && (
                    <button onClick={() => setUserSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-400">
                  Showing <span className="font-bold text-white">{filteredUsers.length}</span> citizens
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 font-semibold">CITIZEN PROFILE</th>
                      <th className="p-3.5 font-semibold">EMAIL / CONTACT / UID</th>
                      <th className="p-3.5 font-semibold">TIER</th>
                      <th className="p-3.5 font-semibold text-right">AKD BALANCE</th>
                      <th className="p-3.5 font-semibold text-right">DAILY LIMIT</th>
                      <th className="p-3.5 font-semibold text-center">STATUS</th>
                      <th className="p-3.5 font-semibold text-right">CONTROLS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center shrink-0">
                              {user.name.slice(0, 1)}
                            </div>
                            <div>
                              <div className="font-bold text-white text-sm">{user.name}</div>
                              <div className="text-[11px] text-slate-400">{user.username}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="text-amber-300 font-bold">{user.email || '—'}</div>
                          <div className="text-slate-300 text-[11px]">{user.phone}</div>
                          <div className="text-[10px] text-slate-500 font-mono">UID: {user.uid}</div>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            user.kycTier === 2
                              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {user.kycTier === 2 ? <BadgeCheck size={11} /> : null}
                            <span>Tier {user.kycTier}</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="font-black text-white font-mono">{user.akdBalance.toFixed(2)} AKD</div>
                          <div className="text-[10px] text-slate-400 font-mono">${user.usdBalance.toFixed(2)} USD</div>
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="text-slate-300 font-mono">{user.dailyLimit.toLocaleString()} AKD</div>
                          <div className="text-[10px] text-slate-500 font-mono">Used: {user.dailyUsed.toLocaleString()}</div>
                        </td>

                        <td className="p-3.5 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                            user.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            user.status === 'SUSPENDED' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                            'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}>
                            {user.status}
                          </span>
                        </td>

                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleOpenUserControl(user)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-bold transition inline-flex items-center gap-1.5"
                          >
                            <SlidersHorizontal size={12} />
                            <span>Control</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 4: LEDGER MASTER AUDIT TRAILS
            ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  <span>{isAk ? 'စာရင်းစစ်ချုပ်နှင့် အရောင်းအဝယ်မှတ်တမ်း' : 'Ledger Master Cryptographic Audit Trail'}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {isAk ? 'အတည်ပြုပြီးသော အရောင်းအဝယ်များနှင့် အတည်ပြုချက် လက်မှတ်များ' : 'Immutable journal of consensus validated transactions and cryptographic proofs'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition shadow-md"
                >
                  <Download size={13} />
                  <span>{isAk ? 'CSV ထုတ်ယူမည်' : 'Export Full CSV'}</span>
                </button>
              </div>
            </div>

            {/* Search and Category Filters for Audit Trail */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder={isAk ? 'Ref ID၊ Hash သို့မဟုတ် Counterparty ရှာရန်...' : 'Search Ref ID, Hash, counterparty...'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
                {auditSearch && (
                  <button onClick={() => setAuditSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
                {['all', 'transfer', 'pos', 'remittance', 'cashout'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAuditCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-xl uppercase font-bold text-[11px] transition ${
                      auditCategoryFilter === cat ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              {loadingTxs ? (
                <div className="text-center py-12 text-slate-400 font-mono text-xs flex flex-col items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-amber-400" />
                  <span>Loading ledger entries...</span>
                </div>
              ) : filteredTxs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  No cryptographic transactions matching the filter.
                </div>
              ) : (
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3.5 font-semibold">TX REF / HASH</th>
                      <th className="p-3.5 font-semibold">COUNTERPARTY</th>
                      <th className="p-3.5 font-semibold">CATEGORY</th>
                      <th className="p-3.5 font-semibold">TIMESTAMP</th>
                      <th className="p-3.5 font-semibold text-right">AMOUNT</th>
                      <th className="p-3.5 font-semibold text-right">CONSENSUS STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/60">
                    {filteredTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{tx.refId}</span>
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">{tx.hash}</span>
                        </td>
                        <td className="p-3.5 text-slate-300">
                          <div>{tx.counterparty}</div>
                          {tx.counterpartyMm && <div className="text-[10px] text-slate-500">{tx.counterpartyMm}</div>}
                        </td>
                        <td className="p-3.5 uppercase text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px]">
                            {tx.category}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">{tx.time}</td>
                        <td className="p-3.5 text-right font-bold text-white">
                          {tx.amount.toFixed(2)} {tx.currency}
                        </td>
                        <td className="p-3.5 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 5: CENTRAL MONETARY & RISK POLICIES
            ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'policy' && (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-800">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <span>{isAk ? 'ဗဟိုငွေကြေးမူဝါဒနှင့် စနစ်စည်းမျဉ်းများ' : 'Monetary Authority & Risk Parameters'}</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {isAk ? 'ငွေလွှဲနှုန်းထား၊ အင်တာနက်မဲ့ကန့်သတ်ချက်နှင့် အရန်ငွေ အချိုးအစားများ' : 'Control transaction fee ceilings, offline BLE mesh risk exposure, and reserve backing ratios'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
              {/* P2P Transfer Fee Ceiling */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">P2P Transfer Fee Ceiling</div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    {p2pFee.toFixed(2)}% (Citizen Free)
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Zero transfer fee charter enforced across citizen wallets in Arakan State.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={p2pFee}
                    onChange={(e) => setP2pFee(parseFloat(e.target.value))}
                    className="w-full accent-red-600 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.00% (Free)</span>
                    <span>0.50%</span>
                    <span>1.00% (Cap)</span>
                  </div>
                </div>
              </div>

              {/* Merchant QR Surcharge Policy */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">Merchant AK QR Transaction Fee</div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    {merchantFee.toFixed(2)}%
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Retailer settlement fee. Standardized zero surcharge policy for local commerce.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={merchantFee}
                    onChange={(e) => setMerchantFee(parseFloat(e.target.value))}
                    className="w-full accent-red-600 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>0.00%</span>
                    <span>1.00%</span>
                    <span>2.00%</span>
                  </div>
                </div>
              </div>

              {/* Offline BLE Mesh Voucher Ceiling */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">Offline BLE Mesh Voucher Limit</div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/15 text-amber-400 font-bold">
                    {meshVoucherCeiling.toFixed(2)} AKD
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Maximum risk exposure per offline air-gapped cryptographic cycle before reconnection.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="50"
                    max="1000"
                    step="50"
                    value={meshVoucherCeiling}
                    onChange={(e) => setMeshVoucherCeiling(parseFloat(e.target.value))}
                    className="w-full accent-red-600 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>50 AKD</span>
                    <span>500 AKD</span>
                    <span>1,000 AKD</span>
                  </div>
                </div>
              </div>

              {/* Reserve Backing Mandate */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">Reserve Backing Mandate</div>
                  <span className="px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-400 font-bold">
                    {reserveRatio.toFixed(2)}% (1:1 USDT)
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Mandatory full backing ratio against audited USDT reserves in institutional custodian vaults.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="90"
                    max="100"
                    step="0.5"
                    value={reserveRatio}
                    onChange={(e) => setReserveRatio(parseFloat(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-cyan-300 mt-1">
                    <span>90.00% (Minimum)</span>
                    <span>100.00% (Mandated)</span>
                  </div>
                </div>
              </div>

              {/* Tier 1 Daily Velocity Limit */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">Tier-1 Citizen Daily Velocity Ceiling</div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-white font-bold">
                    {dailyTier1Limit.toLocaleString()} AKD
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Maximum daily transaction ceiling for basic email-verified citizen accounts.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="10000"
                    max="100000"
                    step="5000"
                    value={dailyTier1Limit}
                    onChange={(e) => setDailyTier1Limit(parseInt(e.target.value))}
                    className="w-full accent-red-600 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>10,000 AKD</span>
                    <span>50,000 AKD</span>
                    <span>100,000 AKD</span>
                  </div>
                </div>
              </div>

              {/* Tier 2 Daily Velocity Limit */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">Tier-2 Verified Citizen Daily Velocity Ceiling</div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-bold">
                    {dailyTier2Limit.toLocaleString()} AKD
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  Expanded daily transaction ceiling for citizens verified with national ID smart cards.
                </p>
                <div className="pt-2">
                  <input
                    type="range"
                    min="100000"
                    max="1000000"
                    step="25000"
                    value={dailyTier2Limit}
                    onChange={(e) => setDailyTier2Limit(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>100,000 AKD</span>
                    <span>500,000 AKD</span>
                    <span>1,000,000 AKD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Policies Feedback Button */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => triggerToast(isAk ? 'ငွေကြေးမူဝါဒနှင့် ကန့်သတ်ချက်များကို ကွန်ရက်သို့ အတည်ပြုပြီးပါပြီ' : 'System policies successfully updated across all consensus nodes')}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl shadow-lg transition"
              >
                {isAk ? 'မူဝါဒများ အတည်ပြု သိမ်းဆည်းမည်' : 'Deploy & Apply Monetary Policies'}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB 6: CONSENSUS VALIDATOR NODES & MESH TELEMETRY
            ═══════════════════════════════════════════════════════════ */}
        {activeTab === 'nodes' && (
          <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-400" />
                  <span>{isAk ? 'ဗဟိုကွန်ရက် အတည်ပြု နုတ်ဒ်များ (Consensus Nodes)' : 'Core Consensus & Regional Relay Nodes'}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {isAk ? 'အာရက္ခဒေသတစ်ဝှမ်း သီးခြားလွတ်လပ်သော အတည်ပြုစက်များ၏ အခြေအနေ' : 'Distributed Byzantine Fault Tolerant (BFT) nodes securing transaction settlement'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 font-bold">42 / 42 ONLINE (100%)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-mono text-xs">
              {nodesList.map((node) => (
                <div
                  key={node.id}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-3 hover:border-slate-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{node.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">{node.id}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">{node.region} • IP: {node.ip}</div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                      {node.state}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-900 grid grid-cols-4 gap-2 text-center text-[10px]">
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <div className="text-slate-500">Latency</div>
                      <div className="font-bold text-emerald-400">{node.ping}ms</div>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <div className="text-slate-500">Uptime</div>
                      <div className="font-bold text-white">{node.uptime}</div>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <div className="text-slate-500">Block Height</div>
                      <div className="font-bold text-amber-400">#{node.blockHeight}</div>
                    </div>
                    <div className="bg-slate-900/60 p-1.5 rounded-lg">
                      <div className="text-slate-500">CPU Load</div>
                      <div className="font-bold text-white">{node.cpu}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 1: CITIZEN KYC DOSSIER & DOCUMENT INSPECTION
          ═══════════════════════════════════════════════════════════ */}
      {selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg font-mono">
                  {selectedApplicant.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black">{selectedApplicant.name}</h3>
                    {selectedApplicant.nameMm && <span className="text-sm text-slate-400 font-myanmar">({selectedApplicant.nameMm})</span>}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Application ID: <span className="text-white font-bold">{selectedApplicant.id}</span> • Submitted: {selectedApplicant.submitted}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedApplicant(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* AI Biometric & AML Analysis Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">Facial Biometric Match</div>
                <div className="text-base font-black text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={14} />
                  <span>{selectedApplicant.faceMatchScore}% Match</span>
                </div>
                <div className="text-[10px] text-slate-500">Liveness check verified</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">AML & Sanctions Screening</div>
                <div className="text-base font-black text-emerald-400">CLEAN (0 Flags)</div>
                <div className="text-[10px] text-slate-500">PEP Check: Negative</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-slate-400 text-[10px]">Document Security Grade</div>
                <div className="text-base font-black text-amber-400">{selectedApplicant.riskScore} Risk</div>
                <div className="text-[10px] text-slate-500">{selectedApplicant.docQuality}</div>
              </div>
            </div>

            {/* Citizen Identity Data Fields */}
            <div className="space-y-3 font-mono text-xs">
              <h4 className="font-bold text-slate-300 text-xs tracking-wider uppercase">Citizen Registered Data</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Full Legal Name</span>
                  <span className="font-bold text-white">{selectedApplicant.name} ({selectedApplicant.nameMm})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Father's Name</span>
                  <span className="font-bold text-white">{selectedApplicant.fatherName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">National ID (NRC) Card No</span>
                  <span className="font-black text-amber-400">{selectedApplicant.idCard}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Date of Birth & Gender</span>
                  <span className="font-bold text-white">{selectedApplicant.dob} ({selectedApplicant.gender})</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Township & Residential Address</span>
                  <span className="font-bold text-white">{selectedApplicant.township}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Phone & Contact Email</span>
                  <span className="font-bold text-white">{selectedApplicant.phone}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 col-span-1 sm:col-span-2">
                  <span className="text-slate-500 text-[10px] block">Cryptographic Wallet Address</span>
                  <span className="font-mono text-slate-300 text-[11px] truncate block">{selectedApplicant.walletAddress}</span>
                </div>
              </div>
            </div>

            {/* Smart ID Card & Document Preview Simulation */}
            <div className="space-y-3 font-mono text-xs">
              <h4 className="font-bold text-slate-300 text-xs tracking-wider uppercase">Document Inspections</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front of ID */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-[11px] text-amber-400">ARAKAN DIGITAL SMART ID</span>
                    <span className="text-[10px] text-slate-500">FRONT</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-16 h-20 rounded-lg bg-slate-800 border border-slate-700 flex flex-col items-center justify-center text-slate-400 text-[10px] relative">
                      <UserCheck size={24} className="text-slate-500" />
                      <span className="mt-1">PHOTO</span>
                      <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="font-bold text-white">{selectedApplicant.name}</div>
                      <div className="text-slate-400">{selectedApplicant.nameMm}</div>
                      <div className="text-amber-300 font-mono font-black">{selectedApplicant.idCard}</div>
                      <div className="text-slate-500">{selectedApplicant.township}</div>
                    </div>
                  </div>
                </div>

                {/* Biometric Live Selfie Check */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 relative overflow-hidden shadow-inner">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-[11px] text-emerald-400">BIOMETRIC LIVENESS VERIFICATION</span>
                    <span className="text-[10px] text-slate-500">SELFIE</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="w-16 h-20 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex flex-col items-center justify-center text-emerald-400 text-[10px]">
                      <Sparkles size={20} />
                      <span className="mt-1">LIVENESS</span>
                    </div>
                    <div className="space-y-1 text-[10px]">
                      <div className="text-emerald-400 font-bold">Passed 3D Depth Check</div>
                      <div className="text-slate-400">Match Confidence: {selectedApplicant.faceMatchScore}%</div>
                      <div className="text-slate-500">Anti-Spoofing: Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operator Notes */}
            {selectedApplicant.complianceNotes && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
                <span className="text-slate-500 block text-[10px]">Compliance Remark:</span>
                {selectedApplicant.complianceNotes}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setSelectedApplicant(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-slate-300 transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {selectedApplicant.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleOpenRejectModal(selectedApplicant)}
                      className="px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-mono font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle size={14} />
                      <span>Reject Application</span>
                    </button>

                    <button
                      onClick={() => handleApproveKyc(selectedApplicant)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition flex items-center gap-2 shadow-lg"
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve Tier-2 Verification</span>
                    </button>
                  </>
                )}

                {selectedApplicant.status === 'Approved' && (
                  <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Verified Citizen</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 2: KYC REJECTION REASON SELECTOR
          ═══════════════════════════════════════════════════════════ */}
      {rejectModalOpen && selectedApplicant && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-red-500/40 text-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-red-400" />
                <h3 className="font-bold text-sm text-white">Reject KYC Application ({selectedApplicant.id})</h3>
              </div>
              <button onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Please specify the rejection cause. The citizen will receive an automated notification detailing the resubmission requirement.
            </p>

            {/* Structured Reasons */}
            <div className="space-y-2 text-xs font-mono">
              {[
                'Blurry photo / Unreadable NRC ID document',
                'Biometric selfie does not match ID document photo',
                'Expired or invalid national registration document',
                'Name spelling does not match civil registry record',
                'Suspected digital alteration or forged document',
                'Other administrative reason',
              ].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setSelectedRejectReason(reason)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                    selectedRejectReason === reason
                      ? 'bg-red-500/10 border-red-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={selectedRejectReason === reason}
                    onChange={() => setSelectedRejectReason(reason)}
                    className="accent-red-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {/* Custom Note */}
            <div>
              <label className="text-xs font-mono text-slate-400 block mb-1.5">Additional Operator Note (Optional):</label>
              <textarea
                value={customRejectNote}
                onChange={(e) => setCustomRejectNote(e.target.value)}
                placeholder="Explain specific guidance for the citizen..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                rows={2}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-mono font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectKyc}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-mono font-bold text-white transition shadow-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 3: CITIZEN / USER CONTROL CONSOLE
          ═══════════════════════════════════════════════════════════ */}
      {userControlModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-lg font-mono">
                  {selectedUser.name.slice(0, 1)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black">{selectedUser.name}</h3>
                    <span className="text-xs text-slate-400 font-mono">{selectedUser.username}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    UID: <span className="text-white font-bold">{selectedUser.uid}</span> • Status:{' '}
                    <span className={`font-bold ${
                      selectedUser.status === 'ACTIVE' ? 'text-emerald-400' :
                      selectedUser.status === 'SUSPENDED' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setUserControlModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Balances & Financial Position */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">AKD Ledger Balance</span>
                <span className="text-base font-black text-amber-400">{selectedUser.akdBalance.toFixed(2)} AKD</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">USD Account Balance</span>
                <span className="text-base font-black text-white">${selectedUser.usdBalance.toFixed(2)} USD</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-slate-500 text-[10px] block">Daily Velocity Used</span>
                <span className="text-base font-black text-slate-300">
                  {selectedUser.dailyUsed.toLocaleString()} / {selectedUser.dailyLimit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Action 1: Account Freeze / Security Quarantine */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <ShieldAlert size={14} className={selectedUser.status === 'FROZEN' ? 'text-red-400' : 'text-emerald-400'} />
                    <span>Wallet Transacting Lock (Freeze / Unfreeze)</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Immediately prohibits or restores ledger transfer capabilities.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSuspendUser(selectedUser)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition shadow-md flex items-center gap-1.5 ${
                      selectedUser.status === 'SUSPENDED'
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>{selectedUser.status === 'SUSPENDED' ? 'Lift Suspend' : 'Suspend Account'}</span>
                  </button>

                  <button
                    onClick={() => handleToggleFreezeUser(selectedUser)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition shadow-md flex items-center gap-1.5 ${
                      selectedUser.status === 'FROZEN'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-red-600 hover:bg-red-500 text-white'
                    }`}
                  >
                    {selectedUser.status === 'FROZEN' ? <Unlock size={13} /> : <Lock size={13} />}
                    <span>{selectedUser.status === 'FROZEN' ? 'Unfreeze Wallet' : 'Freeze Wallet'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-500 block mb-1">Administrative Justification / AML Reason:</label>
                <input
                  type="text"
                  value={userActionReason}
                  onChange={(e) => setUserActionReason(e.target.value)}
                  placeholder="e.g. Unusual rapid high velocity transactions or user request"
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Action 2: Daily Limit Adjustment */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Adjust Daily Transaction Ceiling</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Enforces maximum outbound spending limit within 24 rolling hours.
                  </p>
                </div>
                <span className="font-black text-amber-400 text-sm">
                  {newDailyLimit.toLocaleString()} AKD
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={newDailyLimit}
                  onChange={(e) => setNewDailyLimit(parseInt(e.target.value))}
                  className="w-full accent-red-600 bg-slate-800"
                />
                <button
                  onClick={() => handleSaveDailyLimit(selectedUser)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold shrink-0 transition"
                >
                  Apply Limit
                </button>
              </div>
            </div>

            {/* Action 3: Security & Session Reset */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 font-mono text-xs">
              <div>
                <div className="font-bold text-white text-xs">Force Mandatory PIN Re-Enrollment</div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Terminates active device sessions and forces user to authenticate via Email OTP.
                </div>
              </div>
              <button
                onClick={() => handleResetPinForUser(selectedUser)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 font-bold transition shrink-0"
              >
                Reset PIN
              </button>
            </div>

            {/* Compliance History Log */}
            {selectedUser.complianceNotes && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
                <span className="text-slate-500 block text-[10px]">Internal Operator Notes:</span>
                {selectedUser.complianceNotes}
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setUserControlModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-white transition"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODAL 4: EMERGENCY CIRCUIT BREAKER (KILL SWITCH)
          ═══════════════════════════════════════════════════════════ */}
      {circuitBreakerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-red-500 text-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
              <h3 className="font-black text-base uppercase tracking-wider font-mono">
                {circuitBreakerActive ? 'Disengage Circuit Breaker' : 'Emergency System Kill-Switch'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 font-mono leading-relaxed">
              {circuitBreakerActive
                ? 'Disengaging the circuit breaker will resume normal transaction broadcasting and consensus finalization across all 42 regional validator nodes.'
                : 'Engaging the circuit breaker will immediately halt all outbound citizen transfers, merchant QR settlements, and node payouts across the entire Arakan digital currency network.'}
            </p>

            <div className="space-y-2 font-mono text-xs">
              <label className="text-slate-400 text-[11px] block">
                Enter Root Security Override PIN (Demo PIN: <span className="text-amber-400 font-bold">9991</span>):
              </label>
              <input
                type="password"
                maxLength={6}
                value={circuitBreakerPin}
                onChange={(e) => setCircuitBreakerPin(e.target.value)}
                placeholder="Enter PIN"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-lg tracking-widest text-white focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  setCircuitBreakerOpen(false);
                  setCircuitBreakerPin('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-mono font-bold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleToggleCircuitBreaker}
                className={`px-5 py-2 rounded-xl text-xs font-mono font-bold text-white transition shadow-lg ${
                  circuitBreakerActive ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {circuitBreakerActive ? 'Confirm Disengage' : 'Confirm Emergency Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}

    </BaseLayout>
  );
};