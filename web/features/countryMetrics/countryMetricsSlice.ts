import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../app/api';

export interface CountryMetric {
  country_id: number;
  country_name: string;
  total_profit: number;
  total_transactions: number;
  failed_transactions: number;
  success_transactions: number;
  avg_interest_rate: number;
}

interface State {
  metrics: CountryMetric[];
  loading: boolean;
  error: string | null;
}

const initialState: State = {
  metrics: [],
  loading: false,
  error: null,
};

export const fetchCountryMetrics = createAsyncThunk<
  CountryMetric[],
  void,
  { rejectValue: string }
>('countryMetrics/fetchCountryMetrics', async (_, thunkAPI) => {
  try {
    const res = await api.get<CountryMetric[]>('/api/country-metrics/');
    return res.data;
  } catch {
    return thunkAPI.rejectWithValue('Failed to fetch metrics');
  }
});

const countryMetricsSlice = createSlice({
  name: 'countryMetrics',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchCountryMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.metrics = [];
      })
      .addCase(fetchCountryMetrics.fulfilled, (state, action: PayloadAction<CountryMetric[]>) => {
        state.loading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchCountryMetrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error';
      });
  }
});

export default countryMetricsSlice.reducer;
