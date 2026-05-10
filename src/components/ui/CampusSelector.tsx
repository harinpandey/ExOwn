"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Plus, Check, Loader2 } from "lucide-react";
import { getCountries, getStates, getCities, getCampuses, requestCampusAddition } from "@/actions/location";

interface Props {
  onSelect: (campusId: string) => void;
  selectedId?: string;
}

export default function CampusSelector({ onSelect, selectedId }: Props) {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);

  const [selection, setSelection] = useState({
    country: "",
    state: "",
    city: "",
    campus: selectedId || ""
  });

  const [loading, setLoading] = useState({
    countries: false,
    states: false,
    cities: false,
    campuses: false
  });

  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setLoading(prev => ({ ...prev, countries: true }));
    getCountries().then(data => {
      setCountries(data);
      setLoading(prev => ({ ...prev, countries: false }));
    });
  }, []);

  const handleCountrySelect = async (id: string) => {
    setSelection({ country: id, state: "", city: "", campus: "" });
    setStates([]);
    setCities([]);
    setCampuses([]);
    setLoading(prev => ({ ...prev, states: true }));
    const data = await getStates(id);
    setStates(data);
    setLoading(prev => ({ ...prev, states: false }));
  };

  const handleStateSelect = async (id: string) => {
    setSelection(prev => ({ ...prev, state: id, city: "", campus: "" }));
    setCities([]);
    setCampuses([]);
    setLoading(prev => ({ ...prev, cities: true }));
    const data = await getCities(id);
    setCities(data);
    setLoading(prev => ({ ...prev, cities: false }));
  };

  const handleCitySelect = async (id: string) => {
    setSelection(prev => ({ ...prev, city: id, campus: "" }));
    setCampuses([]);
    setLoading(prev => ({ ...prev, campuses: true }));
    const data = await getCampuses(id);
    setCampuses(data);
    setLoading(prev => ({ ...prev, campuses: false }));
  };

  const handleCampusSelect = (id: string) => {
    setSelection(prev => ({ ...prev, campus: id }));
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Country */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Country</label>
          <div className="relative">
            <select 
              value={selection.country}
              onChange={(e) => handleCountrySelect(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all appearance-none font-bold"
            >
              <option value="">Select Country</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* State */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">State</label>
          <div className="relative">
            <select 
              disabled={!selection.country || loading.states}
              value={selection.state}
              onChange={(e) => handleStateSelect(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all appearance-none font-bold disabled:opacity-50"
            >
              <option value="">{loading.states ? "Loading..." : "Select State"}</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* City */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">City</label>
          <div className="relative">
            <select 
              disabled={!selection.state || loading.cities}
              value={selection.city}
              onChange={(e) => handleCitySelect(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all appearance-none font-bold disabled:opacity-50"
            >
              <option value="">{loading.cities ? "Loading..." : "Select City"}</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Campus */}
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Campus</label>
          <div className="relative">
            <select 
              disabled={!selection.city || loading.campuses}
              value={selection.campus}
              onChange={(e) => handleCampusSelect(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-primary outline-none transition-all appearance-none font-bold disabled:opacity-50"
            >
              <option value="">{loading.campuses ? "Loading..." : "Select Campus"}</option>
              {campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsRequesting(true)}
          className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest hover:underline"
        >
          <Plus size={14} /> Request Campus Addition
        </button>
      </div>

      {isRequesting && (
        <div className="p-4 bg-primary/5 rounded-2xl border-2 border-primary/10 animate-in fade-in slide-in-from-top-2">
          <h4 className="text-sm font-black mb-2">Request New Campus</h4>
          <p className="text-[10px] text-gray-500 mb-4">Enter the details of the campus you'd like to add. Our team will verify and add it.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Campus Name (e.g. VIT Vellore)"
              className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border-2 border-transparent focus:border-primary outline-none transition-all text-sm font-bold"
            />
            <button 
              onClick={() => setIsRequesting(false)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-black"
            >
              Request
            </button>
            <button 
              onClick={() => setIsRequesting(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-xl text-sm font-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
