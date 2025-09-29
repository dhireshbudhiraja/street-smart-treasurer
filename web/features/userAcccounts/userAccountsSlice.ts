import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../app/api';

export interface UserAccount {
  id: number;
  username: string;
  country: string;
  currency: string;
}

interface UserAccountsState {
  users: UserAccount[];
  loading: boolean;
  error: string | null;
  transferLoading: boolean;
  transferError: string | null;
  transferSuccess: string | null;
}

const initialState: UserAccountsState = {
  users: [],
  loading: false,
  error: null,
  transferLoading: false,
  transferError: null,
  transferSuccess: null,
};

export const fetchUserAccounts = createAsyncThunk(
  'userAccounts/fetchUserAccounts',
  async () => {
    const response = await api.get<UserAccount[]>('/api/user-accounts/');
    return response.data;
  }
);

export const transferMoney = createAsyncThunk<
  string, // success message return
  { fromUserId: number; toUserId: number; amount: string },
  { rejectValue: string }
>(
  'userAccounts/transferMoney',
  async ({ fromUserId, toUserId, amount }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/transfer/', {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount,
      });
      return response.data.message || 'Transfer successful';
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error || 'Transfer failed');
    }
  }
);

const userAccountsSlice = createSlice({
  name: 'userAccounts',
  initialState,
  reducers: {
    clearTransferMessages(state) {
      state.transferError = null;
      state.transferSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserAccounts.fulfilled, (state, action: PayloadAction<UserAccount[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserAccounts.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to load users';
        state.loading = false;
      })
      .addCase(transferMoney.pending, (state) => {
        state.transferLoading = true;
        state.transferError = null;
        state.transferSuccess = null;
      })
      .addCase(transferMoney.fulfilled, (state, action: PayloadAction<string>) => {
        state.transferLoading = false;
        state.transferSuccess = action.payload;
      })
      .addCase(transferMoney.rejected, (state, action) => {
        state.transferLoading = false;
        state.transferError = action.payload || 'Transfer failed';
      });
  },
});

export const { clearTransferMessages } = userAccountsSlice.actions;
export default userAccountsSlice.reducer;
