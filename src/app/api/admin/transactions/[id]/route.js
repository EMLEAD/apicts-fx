import { NextResponse } from 'next/server';
import { Transaction, User } from '@/lib/db/models';
import jwt from 'jsonwebtoken';
import emailService from '@/lib/email/service';

async function authenticateAdmin(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { authenticated: false, error: 'No token provided' };
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.userId);
    if (!user || !['super_admin', 'admin', 'manager', 'support'].includes(user.role)) {
      return { authenticated: false, error: 'Unauthorized' };
    }

    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

export async function PATCH(request, { params }) {
  try {
    const auth = await authenticateAdmin(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const transaction = await Transaction.findByPk(params.id);

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const oldStatus = transaction.status;
    const newStatus = body.status;

    // If this is a sell transaction (check both type and metadata) being marked as completed, credit the user
    const txMetadata = typeof transaction.metadata === 'string' ? JSON.parse(transaction.metadata) : transaction.metadata;
    const isSellTransaction = 
      transaction.type === 'sell' || 
      (txMetadata && (txMetadata.sellStatus || txMetadata.transactionType === 'product_sell' || txMetadata.images));
      
    if (isSellTransaction && newStatus === 'completed' && oldStatus !== 'completed') {
      const user = await User.findByPk(transaction.userId);
      if (user) {
        // Credit user's wallet
        const currentBalance = parseFloat(user.walletBalance || 0);
        const transactionAmount = parseFloat(transaction.amount || 0);
        
        await user.update({
          walletBalance: currentBalance + transactionAmount
        });
        
        console.log(`💰 Credited user ${user.id} with NGN ${transactionAmount} for sell transaction ${transaction.id}`);
      }
    }

    await transaction.update({
      status: newStatus,
      processedAt: newStatus === 'completed' ? new Date() : transaction.processedAt
    });

    // Send email notification on status update
    if (newStatus && oldStatus !== newStatus) {
      try {
        const user = await User.findByPk(transaction.userId);
        if (user) {
          let emailSubject = `Transaction ${newStatus} - ${transaction.type || 'sell'}`;
          let emailData = {
            status: newStatus,
            transactionId: transaction.id,
            type: transaction.type || 'sell',
            amount: `${transaction.currency || 'NGN'} ${Number(transaction.amount).toLocaleString()}`,
            fromCurrency: transaction.currency || 'NGN',
            toCurrency: transaction.targetCurrency || 'USD',
            exchangeRate: transaction.exchangeRate || 1,
            fee: transaction.fees || 0
          };

          // Customize email for sell transactions
          if (isSellTransaction) {
            if (newStatus === 'completed') {
              emailSubject = 'Your Sell Order Has Been Completed!';
              emailData = {
                ...emailData,
                productName: txMetadata?.productName || transaction.targetCurrency,
                quantity: txMetadata?.quantity,
                credited: true,
                newBalance: `${transaction.currency || 'NGN'} ${(parseFloat(user.walletBalance) + parseFloat(transaction.amount)).toLocaleString()}`
              };
            }
          }

          await emailService.sendTransactionNotification(user.email, user.username, emailData);
        }
      } catch (emailError) {
        console.error('Error sending transaction status email:', emailError);
      }
    }

    // Ensure metadata is an object
    const txJSON = transaction.toJSON();
    if (typeof txJSON.metadata === 'string') {
      try {
        txJSON.metadata = JSON.parse(txJSON.metadata);
      } catch (e) {
        txJSON.metadata = {};
      }
    }

    return NextResponse.json({ transaction: txJSON }, { status: 200 });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


