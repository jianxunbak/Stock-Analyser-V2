import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, updateDoc, query, orderBy, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const useTestPortfolio = (portfolioId) => {
    const [portfolio, setPortfolio] = useState([]);
    const [portfolioList, setPortfolioList] = useState([]);
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(true);
    const [listLoading, setListLoading] = useState(true);
    const { currentUser } = useAuth();

    // 1. Fetch List of Portfolios
    useEffect(() => {
        if (!currentUser) {
            setPortfolioList([]);
            setListLoading(false);
            return;
        }

        const q = query(
            collection(db, 'users', currentUser.uid, 'test_portfolios'),
            orderBy('name')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name || doc.id, // Fallback to ID (original name)
                    ...data
                };
            });
            setPortfolioList(list);
            setListLoading(false);
        }, (error) => {
            console.error("Error fetching test portfolio list:", error);
            setListLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    // 2. Fetch Data for CURRENT Portfolio (All data in one doc)
    useEffect(() => {
        if (!currentUser || !portfolioId) {
            setPortfolio([]);
            setAnalysis('');
            setLoading(false);
            return;
        }

        setLoading(true);

        const docRef = doc(db, 'users', currentUser.uid, 'test_portfolios', portfolioId);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setAnalysis(data.analysis || '');
                setPortfolio(data.portfolio || []);
            } else {
                setAnalysis('');
                setPortfolio([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching test portfolio data:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser, portfolioId]);

    const addToPortfolio = async (item) => {
        if (!currentUser || !portfolioId) return;
        try {
            // 1. Ensure the user document exists (Materialize parent)
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, {
                lastActive: new Date().toISOString(),
                hasTestPortfolios: true
            }, { merge: true });

            // 2. Add to portfolio array in the portfolio document
            const portRef = doc(db, 'users', currentUser.uid, 'test_portfolios', portfolioId);
            const newItem = {
                ...item,
                id: generateId(),
                createdAt: new Date().toISOString()
            };

            const newList = [...portfolio, newItem];
            await setDoc(portRef, {
                portfolio: newList,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            console.info(`[FIRESTORE SUCCESS] Added ${item.ticker} to array in: users/${currentUser.uid}/test_portfolios/${portfolioId}`);
        } catch (error) {
            console.error("Error adding to test portfolio:", error);
        }
    };

    const removeFromPortfolio = async (id) => {
        if (!currentUser || !portfolioId) return;
        try {
            const newList = portfolio.filter(item => item.id !== id);
            const docRef = doc(db, 'users', currentUser.uid, 'test_portfolios', portfolioId);
            await updateDoc(docRef, { portfolio: newList, updatedAt: new Date().toISOString() });
            console.info(`[FIRESTORE SUCCESS] Removed item from array in: users/${currentUser.uid}/test_portfolios/${portfolioId}`);
        } catch (error) {
            console.error("Error removing from test portfolio:", error);
        }
    };

    const updatePortfolioItem = async (id, updates) => {
        if (!currentUser || !portfolioId) return;
        try {
            const newList = portfolio.map(item =>
                item.id === id ? { ...item, ...updates } : item
            );
            const docRef = doc(db, 'users', currentUser.uid, 'test_portfolios', portfolioId);
            await updateDoc(docRef, { portfolio: newList, updatedAt: new Date().toISOString() });
            console.info(`[FIRESTORE SUCCESS] Updated item in array in: users/${currentUser.uid}/test_portfolios/${portfolioId}`);
        } catch (error) {
            console.error("Error updating test portfolio item:", error);
        }
    };

    const createPortfolio = async (name) => {
        if (!currentUser || !name) return null;
        try {
            // Ensure the user document exists (Materialize parent)
            const userRef = doc(db, 'users', currentUser.uid);
            await setDoc(userRef, { lastActive: new Date().toISOString() }, { merge: true });

            const newPortRef = await addDoc(collection(db, 'users', currentUser.uid, 'test_portfolios'), {
                name,
                portfolio: [],
                analysis: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            console.info(`[FIRESTORE SUCCESS] Created portfolio metadata at path: users/${currentUser.uid}/test_portfolios/${newPortRef.id}`);
            return newPortRef.id;
        } catch (error) {
            console.error("Error creating test portfolio:", error);
            return null;
        }
    };

    const deletePortfolio = async (pId) => {
        if (!currentUser || !pId) return;
        try {
            // Since items are now in the document as an array, deleting the doc removes everything.
            await deleteDoc(doc(db, 'users', currentUser.uid, 'test_portfolios', pId));
            console.info(`[FIRESTORE SUCCESS] Deleted portfolio document: ${pId}`);
        } catch (error) {
            console.error("Error deleting test portfolio:", error);
        }
    };

    const clearAnalysis = async () => {
        if (!currentUser || !portfolioId) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid, 'test_portfolios', portfolioId);
            await updateDoc(docRef, {
                analysis: '',
                analysis_timestamp: null
            });
        } catch (error) {
            console.error("Error clearing analysis:", error);
        }
    };

    // Helper: Fetch Main Portfolio for selection
    const fetchMainPortfolio = async () => {
        if (!currentUser) return [];
        try {
            const userRef = doc(db, 'users', currentUser.uid);
            const userSnap = await import('firebase/firestore').then(mod => mod.getDoc(userRef));
            if (userSnap.exists()) {
                return userSnap.data().portfolio || [];
            }
            return [];
        } catch (error) {
            console.error("Error fetching main portfolio:", error);
            return [];
        }
    };

    // New: Copy SELECTED stocks from Main Portfolio
    const copyItemsFromMain = async (itemsToCopy) => {
        if (!currentUser || !portfolioId || !itemsToCopy || itemsToCopy.length === 0) return;
        try {
            // 2. Prepare items with NEW IDs (deep copy)
            const newItems = itemsToCopy.map(item => ({
                ...item,
                id: generateId(), // vital: new unique ID for test env
                createdAt: new Date().toISOString()
            }));

            // 3. Append to current test portfolio
            const combinedList = [...portfolio, ...newItems];

            // 4. Save to Test Portfolio Doc
            const portRef = doc(db, 'users', currentUser.uid, 'test_portfolios', portfolioId);
            await setDoc(portRef, {
                portfolio: combinedList,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            console.info(`[FIRESTORE SUCCESS] Copied ${newItems.length} items from Main to Test Portfolio ${portfolioId}`);
        } catch (error) {
            console.error("Error copying from main portfolio:", error);
        }
    };

    const renamePortfolio = async (pId, newName) => {
        const idToRename = pId || portfolioId;
        if (!currentUser || !newName || !idToRename) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid, 'test_portfolios', idToRename);
            await updateDoc(docRef, {
                name: newName,
                updatedAt: new Date().toISOString()
            });
            console.info(`[FIRESTORE SUCCESS] Renamed portfolio ID ${idToRename} to "${newName}".`);
        } catch (error) {
            console.error("Error renaming test portfolio in Firestore:", error);
            throw error;
        }
    };

    const clearPortfolio = async () => {
        if (!currentUser || !portfolioId) return;
        try {
            const docRef = doc(db, 'users', currentUser.uid, 'test_portfolios', portfolioId);
            await updateDoc(docRef, {
                portfolio: [],
                updatedAt: new Date().toISOString()
            });
            console.info(`[FIRESTORE SUCCESS] Cleared all items from portfolio ${portfolioId}`);
        } catch (error) {
            console.error("Error clearing portfolio:", error);
        }
    };

    return {
        portfolio,
        portfolioList,
        analysis,
        loading,
        listLoading,
        addToPortfolio,
        removeFromPortfolio,
        updatePortfolioItem,
        renamePortfolio,
        createPortfolio,
        deletePortfolio,
        clearAnalysis,
        fetchMainPortfolio,
        copyItemsFromMain,
        clearPortfolio
    };
};

