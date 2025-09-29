import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../app/api';

export interface BankReserveForecast {
  bank_id: number;
  bank_name: string;
  country: string;
  currency: string;
  predicted_min_reserve_for_next_day: number;
}

interface State {
  forecasts: BankReserveForecast[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  forecasts: [],
  loading: false,
  error: null,
};

export const fetchBankReserveForecast = createAsyncThunk<
  BankReserveForecast[],
  void,
  { rejectValue: string }
>('bankReserve/fetchBankReserveForecast', async (_, thunkAPI) => {
  try {
    const res = await api.get<BankReserveForecast[]>('/api/bank-reserve-forecast/');
    return res.data;
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch bank reserve forecast');
  }
});

const bankReserveForecastSlice = createSlice({
  name: 'bankReserveForecast',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchBankReserveForecast.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.forecasts = [];
      })
      .addCase(fetchBankReserveForecast.fulfilled, (state, action: PayloadAction<BankReserveForecast[]>) => {
        state.loading = false;
        state.forecasts = action.payload;
      })
      .addCase(fetchBankReserveForecast.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error loading data';
      });
  }
});

export default bankReserveForecastSlice.reducer;
