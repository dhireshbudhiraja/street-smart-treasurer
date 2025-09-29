import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../app/api';

type ChargesData = {
  [date: string]: {
    [country: string]: number;
  };
};

interface State {
  data: ChargesData | null;
  loading: boolean;
  error: string | null;
  startDate: string;
  endDate: string;
}

const initialState: State = {
  data: null,
  loading: false,
  error: null,
  // Default to last 7 days
  startDate: new Date(Date.now() - 15 * 864e5).toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
};

export const fetchCharges = createAsyncThunk<
  ChargesData,
  { startDate: string; endDate: string },
  { rejectValue: string }
>('transactionCharges/fetchCharges', async ({ startDate, endDate }, thunkAPI) => {
  try {
    const response = await api.get<ChargesData>('/api/daily-transaction-charges/', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  } catch {
    return thunkAPI.rejectWithValue('Failed to load transaction charges data');
  }
});

const transactionChargesSlice = createSlice({
  name: 'transactionCharges',
  initialState,
  reducers: {
    setStartDate(state, action: PayloadAction<string>) {
      state.startDate = action.payload;
    },
    setEndDate(state, action: PayloadAction<string>) {
      state.endDate = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Error';
      });
  },
});

export const { setStartDate, setEndDate } = transactionChargesSlice.actions;
export default transactionChargesSlice.reducer;
