import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../app/api';

export interface Bank {
  account_number: string;
  country: string;
  bank_name: string;
  currency: string;
  balance: string;
  interest_rate_percent: string;
}

interface BanksState {
  banks: Bank[];
  loading: boolean;
  error: string | null;
  country: string;
  countryOptions: string[];
}

const initialState: BanksState = {
  banks: [],
  loading: false,
  error: null,
  country: '',
  countryOptions: [
    'USA', 'RUSSIA', 'INDIA', 'CHINA', 'BRAZIL', 'GERMANY',
    'FRANCE', 'UK', 'JAPAN', 'AUSTRALIA'
  ],
};

export const fetchBanks = createAsyncThunk(
  'banks/fetchBanks',
  async () => {
    const response = await api.get<Bank[]>('/api/banks/', {
      params: {},
    });
    return response.data;
  }
);

const banksSlice = createSlice({
  name: 'banks',
  initialState,
  reducers: {
    setCountry(state, action: PayloadAction<string>) {
      state.country = action.payload;
    },
    // You could add actions to set options dynamically if fetching from another API.
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action: PayloadAction<Bank[]>) => {
        state.banks = action.payload;
        state.loading = false;
      })
      .addCase(fetchBanks.rejected, (state) => {
        state.error = 'Failed to fetch banks';
        state.loading = false;
      });
  },
});

export const { setCountry } = banksSlice.actions;
export default banksSlice.reducer;
