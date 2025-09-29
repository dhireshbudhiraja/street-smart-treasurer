import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../app/api';

export interface CurrencyConversion {
  id: number;
  from_currency: string;
  to_currency: string;
  rate: string;
}

interface CurrencyConversionState {
  conversions: CurrencyConversion[];
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyConversionState = {
  conversions: [],
  loading: false,
  error: null,
};

export const fetchCurrencyConversions = createAsyncThunk(
  'currencyConversion/fetchCurrencyConversions',
  async () => {
    const response = await api.get<CurrencyConversion[]>('/api/currency-conversions/');
    return response.data;
  }
);

const currencyConversionSlice = createSlice({
  name: 'currencyConversion',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencyConversions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencyConversions.fulfilled, (state, action: PayloadAction<CurrencyConversion[]>) => {
        state.conversions = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrencyConversions.rejected, (state) => {
        state.error = 'Failed to fetch currency conversions';
        state.loading = false;
      });
  },
});

export default currencyConversionSlice.reducer;
