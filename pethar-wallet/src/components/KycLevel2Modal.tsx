import React, { useState } from 'react'
import {
  X, ShieldCheck, CheckCircle2, Clock,
  Upload, FileText, Check, AlertCircle, Sparkles
} from 'lucide-react'
import type { Language } from '../i18n'
import type { UserProfile } from '../data'
import { submitKycLevel2Verification } from '../services/walletDatabase'

interface KycLevel2ModalProps {
  isOpen: boolean
  onClose: () => void
  currentProfile: UserProfile
  onUpdateProfile: (updated: UserProfile) => void
  lang: Language
}

export const KycLevel2Modal: React.FC<KycLevel2ModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdateProfile,
  lang,
}) => {
  const isAk = lang === 'ak'

  const [firstName, setFirstName] = useState(currentProfile.firstName || '')
  const [lastName, setLastName] = useState(currentProfile.lastName || '')
  const [nationalIdNo, setNationalIdNo] = useState(currentProfile.nationalIdNo || '')
  const [dob, setDob] = useState(currentProfile.dob || '')
  const [address, setAddress] = useState(currentProfile.address || currentProfile.location || '')
  const [docUploaded, setDocUploaded] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successToast, setSuccessToast] = useState('')

  if (!isOpen) return null

  const isAlreadyVerified = currentProfile.kycTier === 2 && currentProfile.kycStatus === 'verified'
  const isPendingReview = currentProfile.kycStatus === 'pending_review'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg(isAk ? 'ပထမအမည်နှင့် နောက်ဆုံးအမည် ထည့်သွင်းပါ' : 'Please enter First Name and Last Name')
      return
    }
    if (!nationalIdNo.trim()) {
      setErrorMsg(isAk ? 'မှတ်ပုံတင် သို့မဟုတ် နိုင်ငံကူးလက်မှတ် အမှတ် ထည့်သွင်းပါ' : 'Please enter your National ID or Passport Number')
      return
    }
    if (!dob.trim()) {
      setErrorMsg(isAk ? 'မွေးသက္ကရာဇ် ထည့်သွင်းပါ' : 'Please select your Date of Birth')
      return
    }
    if (!address.trim()) {
      setErrorMsg(isAk ? 'နေရပ်လိပ်စာ အပြည့်အစုံ ထည့်သွင်းပါ' : 'Please enter your residential address')
      return
    }

    setIsLoading(true)
    try {
      const res = await submitKycLevel2Verification(currentProfile.uid || '202610190001', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        nationalIdNo: nationalIdNo.trim(),
        dob: dob.trim(),
        address: address.trim(),
      })

      setIsLoading(false)
      if (res.success) {
        const updated: UserProfile = {
          ...currentProfile,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          nationalIdNo: nationalIdNo.trim(),
          dob: dob.trim(),
          address: address.trim(),
          accountTier: 'KYC Level 2 (Under Review)',
          kycTier: 2,
          kycStatus: 'pending_review',
        }
        onUpdateProfile(updated)
        setSuccessToast(
          isAk
            ? 'အချက်အလက်များ တင်ပြပြီးပါပြီ။ လိုက်နာမှုစစ်ဆေးရေးမှ စိစစ်နေပါသည် (၅-၁၅ မိနစ်)'
            : 'Personal info submitted! Verification is now under review by our compliance team.'
        )
      } else {
        setErrorMsg(res.error || 'Failed to submit verification request.')
      }
    } catch (err: any) {
      setIsLoading(false)
      setErrorMsg(err.message || 'Submission error')
    }
  }

  // Helper for demo/testing to instantly approve review
  const handleInstantApprove = () => {
    const updated: UserProfile = {
      ...currentProfile,
      firstName: firstName || currentProfile.firstName || 'User',
      lastName: lastName || currentProfile.lastName || 'Verified',
      name: `${firstName || 'User'} ${lastName || 'Verified'}`.trim(),
      nationalIdNo: nationalIdNo || currentProfile.nationalIdNo || 'ID-992100',
      dob: dob || currentProfile.dob || '1998-05-12',
      address: address || currentProfile.address || 'Sittwe, Arakan',
      accountTier: 'KYC Level 2 Verified',
      kycTier: 2,
      kycStatus: 'verified',
    }
    onUpdateProfile(updated)
    setSuccessToast(isAk ? 'KYC Level 2 အတည်ပြုချက် အောင်မြင်ပါသည်!' : 'KYC Level 2 National ID Verification Approved!')
    setTimeout(() => onClose(), 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-[460px] w-full relative shadow-2xl border border-zinc-100 overflow-hidden text-zinc-900 max-h-[90vh] overflow-y-auto">
        {/* Accent Top Border */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-500 to-[#D91624]" />

        {/* Close */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900">
              {isAk ? 'KYC Level 2 အတည်ပြုခြင်း' : 'KYC Level 2 Verification'}
            </h3>
            <p className="text-[11px] text-zinc-500">
              {isAk ? 'နိုင်ငံသားစိစစ်ရေးကတ် / နိုင်ငံကူးလက်မှတ်ဖြင့် အတည်ပြုခြင်း' : 'National ID & Personal Info Verification'}
            </p>
          </div>
        </div>

        {/* Level Indicator Card */}
        <div className="mb-4 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {isAk ? 'Level 1: အီးမေးလ် အတည်ပြုပြီး' : 'Level 1: Email Verified'}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-bold border-t border-zinc-200/60 pt-2">
            <span className="flex items-center gap-1.5 text-zinc-800">
              <FileText className="w-4 h-4 text-amber-500" />
              {isAk ? 'Level 2: နိုင်ငံသားစိစစ်ရေးကတ် (National ID)' : 'Level 2: National ID Verified'}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                isAlreadyVerified
                  ? 'bg-emerald-100 text-emerald-800'
                  : isPendingReview
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              {isAlreadyVerified
                ? 'Verified'
                : isPendingReview
                ? isAk ? 'စိစစ်နေဆဲ' : 'Under Review'
                : isAk ? 'လိုအပ်သည်' : 'Required'}
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 font-medium italic">
            {isAk ? '* မှတ်ချက်: ဖေ့သာတွင် Level 1 နှင့် Level 2 သာရှိပြီး Level 3 မရှိပါ' : '* Note: Péthar only provides KYC Level 1 and Level 2 (no Level 3).'}
          </div>
        </div>

        {/* Alerts */}
        {successToast && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successToast}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-[#D91624] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* IF ALREADY VERIFIED */}
        {isAlreadyVerified && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-emerald-900">
              {isAk ? 'KYC Level 2 အတည်ပြုပြီးပါပြီ' : 'KYC Level 2 Verified'}
            </h4>
            <p className="text-xs text-emerald-700">
              {isAk
                ? 'သင့် အမျိုးသားမှတ်ပုံတင်နှင့် ကိုယ်ရေးအချက်အလက်များကို အောင်မြင်စွာ အတည်ပြုထားပါသည်'
                : 'Your National ID and personal information have been verified.'}
            </p>
            <div className="text-left font-mono text-xs bg-white/80 p-3 rounded-xl border border-emerald-100 space-y-1">
              <div>Name: {currentProfile.name}</div>
              <div>ID No: {currentProfile.nationalIdNo}</div>
              <div>DOB: {currentProfile.dob}</div>
            </div>
          </div>
        )}

        {/* IF PENDING REVIEW */}
        {isPendingReview && !isAlreadyVerified && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <Clock className="w-5 h-5 text-amber-600 animate-spin" />
              <span>{isAk ? 'စစ်ဆေးရေးမှ စိစစ်နေပါသည်' : 'Verification Under Review'}</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {isAk
                ? 'သင် တင်ပြထားသော နိုင်ငံသားမှတ်ပုံတင် အချက်အလက်များကို စိစစ်ရေးအဖွဲ့မှ စစ်ဆေးနေပါသည်။ စိစစ်မှု ပြီးစီးပါက အလိုအလျောက် Level 2 သို့ တိုးမြှင့်ပေးပါမည်။'
                : 'Your submitted National ID details are currently queued for compliance review. Review usually takes 5-15 minutes.'}
            </p>

            <button
              type="button"
              onClick={handleInstantApprove}
              className="w-full py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAk ? 'ချက်ချင်း အတည်ပြုချက် စမ်းသပ်မည်' : 'Simulate Instant Approval (Demo)'}</span>
            </button>
          </div>
        )}

        {/* IF NOT YET SUBMITTED */}
        {!isAlreadyVerified && !isPendingReview && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  {isAk ? 'ပထမအမည်' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                  {isAk ? 'နောက်ဆုံးအမည်' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                {isAk ? 'မှတ်ပုံတင် / နိုင်ငံကူးလက်မှတ် အမှတ်' : 'National ID / Passport Number'}
              </label>
              <input
                type="text"
                value={nationalIdNo}
                onChange={(e) => setNationalIdNo(e.target.value)}
                placeholder="e.g. 12/AHLANA(N)123456"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                {isAk ? 'မွေးသက္ကရာဇ်' : 'Date of Birth'}
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                {isAk ? 'နေရပ်လိပ်စာ အပြည့်အစုံ' : 'Residential Address'}
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isAk ? 'အိမ်အမှတ်၊ လမ်း၊ မြို့' : 'Full residential street address'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-semibold text-zinc-900 focus:outline-none focus:border-[#D91624]"
                required
              />
            </div>

            {/* Document Upload / Photo attachment */}
            <div>
              <label className="block text-[11px] font-bold text-zinc-600 mb-1">
                {isAk ? 'မှတ်ပုံတင် ဓာတ်ပုံ တင်ရန်' : 'Upload National ID Document'}
              </label>
              <button
                type="button"
                onClick={() => setDocUploaded(true)}
                className={`w-full py-3 px-3.5 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                  docUploaded
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-300 hover:border-zinc-400 text-zinc-600 bg-zinc-50'
                }`}
              >
                {docUploaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{isAk ? 'မှတ်ပုံတင် ဓာတ်ပုံ ပူးတွဲပြီးပါပြီ' : 'National ID Document Attached'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-zinc-400" />
                    <span>{isAk ? 'ဓာတ်ပုံ ရွေးချယ်ရန် နှိပ်ပါ' : 'Click to Upload Front/Back Photo'}</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-full bg-[#D91624] hover:bg-[#B8121E] text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <span>{isAk ? 'စိစစ်ရန် တင်သွင်းမည် (Level 2)' : 'Submit for KYC Level 2 Review'}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default KycLevel2Modal
